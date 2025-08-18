import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as unknown} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, subtitle, icon, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as unknown} size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRefresh = () => {
    fetchEmployees();
  };

  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon="people"
            color="#007AFF"
            onPress={() => router.push('/(tabs)/employees')}
          />
          <StatCard
            title="Active"
            value={activeEmployees}
            icon="checkmark-circle"
            color="#34C759"
          />
          <StatCard
            title="Inactive"
            value={inactiveEmployees}
            icon="pause-circle"
            color="#FF9500"
          />
          <StatCard
            title="Departments"
            value="5"
            icon="business"
            color="#AF52DE"
          />
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction
            title="Add Employee"
            subtitle="Register a new employee"
            icon="person-add"
            color="#007AFF"
            onPress={() => router.push('/employee/new')}
          />
          <QuickAction
            title="Check Attendance"
            subtitle="View today's attendance"
            icon="time"
            color="#34C759"
            onPress={() => router.push('/(tabs)/attendance')}
          />
          <QuickAction
            title="Upload Document"
            subtitle="Add new documents"
            icon="document-text"
            color="#FF9500"
            onPress={() => router.push('/(tabs)/documents')}
          />
          <QuickAction
            title="Generate Report"
            subtitle="Create employee reports"
            icon="bar-chart"
            color="#AF52DE"
            onPress={() => router.push('/reports')}
          />
        </View>
      </View>

      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#34C759' + '20' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Employee Check-in</Text>
              <Text style={styles.activitySubtitle}>John Doe checked in at 9:00 AM</Text>
            </View>
            <Text style={styles.activityTime}>2h ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#007AFF' + '20' }]}>
              <Ionicons name="person-add" size={16} color="#007AFF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Employee Added</Text>
              <Text style={styles.activitySubtitle}>Jane Smith joined the team</Text>
            </View>
            <Text style={styles.activityTime}>1d ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#FF9500' + '20' }]}>
              <Ionicons name="document-text" size={16} color="#FF9500" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Document Uploaded</Text>
              <Text style={styles.activitySubtitle}>Contract for Mike Johnson</Text>
            </View>
            <Text style={styles.activityTime}>2d ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statTitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recentActivityContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
