import { defineStore } from 'pinia';

export const useModalStore = defineStore('modalState', {
  state: () => {
    return {
      isOpen: false,
      type: null,
      payload: null,
    };
  },
});
