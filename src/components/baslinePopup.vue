<template>
  <div
    v-if="modelValue"
    class="modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal-content">
      <slot />
      <button
        class="close-btn"
        @click="onSave"
      >
        儲存
      </button>
      <button
        class="close-btn"
        @click="$emit('update:modelValue', false)"
      >
        取消
      </button>
    </div>
  </div>
</template>
  
  <script setup>
  defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    onSave:{
      type: Function,
      required: true,
    },
  })
  
  defineEmits(['update:modelValue'])
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  .modal-content {
    background: white;
    padding: 24px;
    border-radius: 8px;
    min-width: 300px;
  }
  .close-btn {
    margin-top: 20px;
    background: #999;
    border: none;
    padding: 8px 16px;
    color: white;
    cursor: pointer;
  }
  </style>