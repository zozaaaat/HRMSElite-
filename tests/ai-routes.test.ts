import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';

// Type definitions for AI route responses
interface SummaryResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
}

interface SentimentResponse {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  textLength: number;
}

interface KeywordsResponse {
  keywords: string[];
  count: number;
  textLength: number;
}

interface InsightsResponse {
  insights: string[];
  count: number;
  generatedAt: string;
}

interface AnalysisResponse {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  analysis: {
    originalLength: number;
    summaryLength: number;
    compressionRatio: number;
    keywordCount: number;
  };
  generatedAt: string;
}

interface StatusResponse {
  status: 'ready' | 'initializing';
  service: string;
  version: string;
  features: string[];
  timestamp: string;
}



describe('AI Routes', () => {
  const testText = 'هذا نص تجريبي لاختبار وظائف الذكاء الاصطناعي في نظام إدارة الموارد البشرية. النص يحتوي على معلومات مهمة حول أداء الموظفين وتحليل البيانات.';

  describe('POST /api/ai/summary', () => {
    it('should generate summary for valid text', async () => {
      const response = await request(app)
        .post('/api/ai/summary')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({ text: testText });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('originalLength');
      expect(response.body).toHaveProperty('summaryLength');
      expect(response.body).toHaveProperty('compressionRatio');
      
      const body = response.body as SummaryResponse;
      expect(typeof body.summary).toBe('string');
      expect(body.summary.length).toBeLessThan(testText.length);
    });

    it('should return error for missing text', async () => {
      const response = await request(app)
        .post('/api/ai/summary')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for short text', async () => {
      const response = await request(app)
        .post('/api/ai/summary')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({ text: 'قصير' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/ai/sentiment', () => {
    it('should analyze sentiment for valid text', async () => {
      const response = await request(app)
        .post('/api/ai/sentiment')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({ text: testText });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sentiment');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('textLength');
      
      const body = response.body as SentimentResponse;
      expect(['positive', 'negative', 'neutral']).toContain(body.sentiment);
      expect(body.confidence).toBeGreaterThan(0);
      expect(body.confidence).toBeLessThanOrEqual(1);
    });

    it('should return error for missing text', async () => {
      const response = await request(app)
        .post('/api/ai/sentiment')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/ai/keywords', () => {
    it('should extract keywords from valid text', async () => {
      const response = await request(app)
        .post('/api/ai/keywords')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({ text: testText });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('keywords');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('textLength');
      
      const body = response.body as KeywordsResponse;
      expect(Array.isArray(body.keywords)).toBe(true);
      expect(body.count).toBe(body.keywords.length);
    });

    it('should return error for missing text', async () => {
      const response = await request(app)
        .post('/api/ai/keywords')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/ai/insights', () => {
    it('should generate insights from valid data', async () => {
      const testData = {
        employees: 100,
        departments: 5,
        attendance: 95
      };

      const response = await request(app)
        .post('/api/ai/insights')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({ data: testData });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('insights');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('generatedAt');
      
      const body = response.body as InsightsResponse;
      expect(Array.isArray(body.insights)).toBe(true);
      expect(body.count).toBe(body.insights.length);
    });

    it('should return error for missing data', async () => {
      const response = await request(app)
        .post('/api/ai/insights')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/ai/analyze', () => {
    it('should perform comprehensive analysis', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({ text: testText });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('sentiment');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('keywords');
      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('generatedAt');
      
      const body = response.body as AnalysisResponse;
      expect(['positive', 'negative', 'neutral']).toContain(body.sentiment);
      expect(Array.isArray(body.keywords)).toBe(true);
      expect(body.analysis).toHaveProperty('originalLength');
      expect(body.analysis).toHaveProperty('summaryLength');
      expect(body.analysis).toHaveProperty('compressionRatio');
      expect(body.analysis).toHaveProperty('keywordCount');
    });

    it('should return error for missing text', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/ai/status', () => {
    it('should return AI service status', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .set('x-user-role', 'company_manager')
        .set('x-user-id', '1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('timestamp');
      
      const body = response.body as StatusResponse;
      expect(['ready', 'initializing']).toContain(body.status);
      expect(body.service).toBe('Local LLM');
      expect(Array.isArray(body.features)).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/summary')
        .send({ text: testText });

      expect(response.status).toBe(401);
    });
  });
}); 