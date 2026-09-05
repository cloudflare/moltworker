import { useState, useEffect, useCallback } from 'react';
import {
  listDevices,
  approveDevice,
  approveAllDevices,
  restartGateway,
  getStorageStatus,
  triggerSync,
  AuthError,
  type PendingDevice,
  type PairedDevice,
  type DeviceListResponse,
  type StorageStatusResponse,
} from '../api';
import ModelUsagePanel from './ModelUsagePanel';
import './AdminPage.css';
