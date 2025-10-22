/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState } from 'react';
export function useConfirmation() {
  const [state, setState] = useState({ message: '', resolve: null });
  function confirm(message) {
    return new Promise((resolve) => {
      setState({ message, resolve });
    });
  }
  function handleConfirm() {
    state.resolve?.(true);
    setState({ message: '', resolve: null });
  }
  function handleCancel() {
    state.resolve?.(false);
    setState({ message: '', resolve: null });
  }
  return { state, confirm, handleConfirm, handleCancel };
}