import React, {useEffect, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {CustomerScreen} from './src/screens/CustomerScreen';
import {AddEditCustomerScreen} from './src/screens/AddEditCustomerScreen';
import {LoadingScreen} from './src/components/LoadingScreen';
import {DatabaseService} from './src/database/DatabaseService';
import {ZellerCustomer} from './src/types';

function App(): React.JSX.Element {
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ZellerCustomer | undefined>();
  const [databaseReady, setDatabaseReady] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  useEffect(() => {
    Feather.loadFont().catch(error => {
      console.warn('Failed to load Feather font:', error);
    });
  }, []);

  const initializeDatabase = async () => {
    try {
      const dbService = DatabaseService.getInstance();
      await dbService.initDatabase();
      setDatabaseReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      Alert.alert(
        'Database Error',
        'Failed to initialize the database. Please restart the app.',
        [{text: 'OK'}]
      );
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setShowAddEditModal(true);
  };

  const handleEditCustomer = (customer: ZellerCustomer) => {
    setEditingCustomer(customer);
    setShowAddEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddEditModal(false);
    setEditingCustomer(undefined);
  };

  if (!databaseReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <CustomerScreen
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
      />

      <Modal
        visible={showAddEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddEditCustomerScreen
          customer={editingCustomer}
          onClose={handleCloseModal}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({});

export default App;