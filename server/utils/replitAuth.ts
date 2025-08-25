import * as client from 'openid-client';
import {Strategy, type VerifyFunction} from 'openid-client/passport';

import passport from 'passport';
import session from 'express-session';
import type {Express, RequestHandler, NextFunction} from 'express';
import type {AuthenticateOptions} from 'passport';
import memoize from 'memoizee';
import connectPg from 'connect-pg-simple';
import {storage} from '../models/storage';
import {log} from './logger';
import { env } from './env';

// Extend Express namespace to include our user type
declare global {
  namespace Express {
    interface User {
      claims?: Record<string, unknown>;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}

// Define proper types for the user object
interface AuthenticatedUser extends Express.User {
  claims?: Record<string, unknown>;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

if (!process.env.REPLIT_DOMAINS) {
  throw new Error('Environment variable REPLIT_DOMAINS not provided');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('Environment variable SESSION_SECRET not provided');
}

const getOidcConfig = memoize(
  async () => {

    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? 'https://replit.com/oidc'),
      process.env.REPL_ID!
    );

  },
  {'maxAge': 3600 * 1000}
);

export function getSession () {

  const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    'conString': process.env.DATABASE_URL,
    'createTableIfMissing': false,
    'ttl': sessionTtl,
    'tableName': 'sessions'
  });
  return session({
    'secret': env.SESSION_SECRET,
    'store': sessionStore,
    'resave': false,
    'saveUninitialized': false,
    'name': process.env.NODE_ENV === 'production' ? '__Host-hrms-elite-session' : 'hrms-elite-session',
    'cookie': {
      'httpOnly': true,
      'secure': true,
      'sameSite': 'strict',
      'maxAge': sessionTtl,
      'path': '/'
    }
  });

}

function updateUserSession (
  user: AuthenticatedUser,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {

  const claims = tokens.claims();
  if (claims) {
    user.claims = claims;
  }
  
  if (tokens.access_token) {
    user.access_token = tokens.access_token;
  }
  
  if (tokens.refresh_token) {
    user.refresh_token = tokens.refresh_token;
  }
  
  const exp = claims?.exp;
  if (typeof exp === 'number') {
    user.expires_at = exp;
  }

}

async function upsertUser (
  claims: Record<string, unknown>
) {

  try {
    // Check if user exists by email
    const existingUser = await storage.getUserByEmail(claims['email'] as string);
    
    if (existingUser) {
      // Update existing user
      await storage.updateUser(existingUser.id, {
        'firstName': claims['first_name'] as string,
        'lastName': claims['last_name'] as string,
        'profileImageUrl': claims['profile_image_url'] as string
      });
    } else {
      // Create new user
      await storage.createUser({
        'id': claims['sub'] as string,
        'email': claims['email'] as string,
        'firstName': claims['first_name'] as string,
        'lastName': claims['last_name'] as string,
        'password': '', // OAuth users don't need password
        'profileImageUrl': claims['profile_image_url'] as string,
        'role': 'worker',
        'isActive': true,
        'emailVerified': true
      });
    }
  } catch (error) {
    log.error('Error upserting user:', error as Error);
    // Don't throw error to avoid breaking authentication flow
  }

}

export async function setupAuth (app: Express) {

  app.set('trust proxy', 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {

    const user: AuthenticatedUser = {} as AuthenticatedUser;
    updateUserSession(user, tokens);
    
    const claims = tokens.claims();
    if (claims) {
      await upsertUser(claims);
    }
    
    verified(null, user);

  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(',')) {

    const strategy = new Strategy(
      {
        'name': `replitauth:${domain}`,
        config,
        'scope': 'openid email profile offline_access',
        'callbackURL': `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);

  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get('/api/login', (req, res, next) => {

    const authenticateOptions: AuthenticateOptions = {
      'prompt': 'login consent',
      'scope': ['openid', 'email', 'profile', 'offline_access']
    };
    
    const authenticate = passport.authenticate as (strategy: string, options?: AuthenticateOptions) => (req: Express.Request, res: Express.Response, next: NextFunction) => void;
    authenticate(`replitauth:${req.hostname}`, authenticateOptions)(req, res, next);

  });

  app.get('/api/callback', (req, res, next) => {

    const authenticateOptions: AuthenticateOptions = {
      'successReturnToOrRedirect': '/',
      'failureRedirect': '/api/login'
    };
    
    const authenticate = passport.authenticate as (strategy: string, options?: AuthenticateOptions) => (req: Express.Request, res: Express.Response, next: NextFunction) => void;
    authenticate(`replitauth:${req.hostname}`, authenticateOptions)(req, res, next);

  });

  app.get('/api/logout', (req, res) => {

    req.logout(() => {

      res.redirect(
        client.buildEndSessionUrl(config, {
          'client_id': process.env.REPL_ID!,
          'post_logout_redirect_uri': `${req.protocol}://${req.hostname}`
        }).href
      );

    });

  });

}

export const _isAuthenticated:  RequestHandler = async (req, res, next) => {

  const user = req.user as AuthenticatedUser;

  if (!req.isAuthenticated() || !user.expires_at) {

    return res.status(401).json({'message': 'Unauthorized'});

  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {

    return next();

  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {

    res.status(401).json({'message': 'Unauthorized'});
    return;

  }

  try {

    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();

  } catch (error) {

    log.error('Token refresh error:', error as Error);
    res.status(401).json({'message': 'Unauthorized'});

  }

};
