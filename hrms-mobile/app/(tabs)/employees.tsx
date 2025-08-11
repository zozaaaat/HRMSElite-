import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEmployeeStore } from '../../stores/employeeStore';
import { Ionicons } from '@expo/vector-icons';

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    position: string;
    department: string;
    status: string;
    avatar?: string;
  };
  onPress: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'inactive':
        return '#FF9500';
      case 'terminated':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {employee.avatar ? (
            <Text style={styles.avatarText}>
              {employee.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons name="person" size={24} color="#8E8E93" />
          )}
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeePosition}>{employee.position}</Text>
          <Text style={styles.employeeDepartment}>{employee.department}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(employee.status) }]}>
          <Text style={styles.statusText}>{employee.status}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.emailContainer}>
          <Ionicons name="mail" size={16} color="#8E8E93" />
          <Text style={styles.emailText}>{employee.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function EmployeesScreen() {
  const router = useRouter();
  const { employees, isLoading, error, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleEmployeePress = (employeeId: string) => {
    router.push(`/employee/${employeeId}`);
  };

  const handleAddEmployee = () => {
    router.push('/employee/new');
  };

  const handleRefresh = () => {
    fetchEmployees();
  };

  if (isLoading && employees.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading employees...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employees</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddEmployee}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EmployeeCard
            employee={item}
            onPress={() => handleEmployeePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Employees</Text>
            <Text style={styles.emptySubtitle}>
              Add your first employee to get started
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddEmployee}>
              <Text style={styles.emptyButtonText}>Add Employee</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  employeeDepartment: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 