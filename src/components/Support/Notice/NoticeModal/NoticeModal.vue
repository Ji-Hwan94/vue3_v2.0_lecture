<script setup>
import { catchError } from '@/common/catchError';
import { useModalStore } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const modalState = useModalStore();
const formRef = ref();
const detail = ref({});
const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(['postSuccess', 'unMountedModal']);

const searchDetail = () => {
  // HTTP 표준상 GET 요청은 body(본문 데이터)를 지원하지 않기 때문에 data가 아닌 param으로 데이터 보내요
  axios
    .get('/api/support/noticeDetail.do', { params: { id: props.id } })
    .then((res) => {
      detail.value = res.data;
    })
    .catch((error) => {
      catchError(error);
    });
};

// formRef.value는 DOM 요소(form element)를 참조합니다
const handleSubmit = () => {
  const formData = new FormData(formRef.value);
  console.log(formData);
  axios
    .post('/api/support/noticeSave.do', formData)
    .then((res) => {
      if (res.data.result === 'SUCCESS') {
        modalState.$patch({ isOpen: false });
        emit('postSuccess');
      }
    })
    .catch((error) => {
      catchError(error);
    });
};

const updateHandler = () => {
  // PATCH는 "일부만 수정" 용도이지만,
  // 실제로는 data에 담긴 모든 값이 서버로 전달됩니다.
  // 진짜 변경된 값만 보내고 싶다면, 직접 필터링해서 보내야 합니다.
  // 서버가 "값이 온 필드만 수정"하도록 구현되어 있다면,
  // 일부 필드만 보내도 정상 동작합니다.
  axios
    .patch('/api/support/noticeUpdate.do', detail.value)
    .then((res) => {
      if (res.data.result === 'SUCCESS') {
        modalState.$patch({ isOpen: false });
        emit('postSuccess');
      }
    })
    .catch((error) => {
      catchError(error);
    });
};

const deleteHandler = () => {
  axios
    .delete('/api/support/noticeDelete.do', { params: { id: props.id } })
    .then((res) => {
      if (res.data.result === 'SUCCESS') {
        modalState.$patch({ isOpen: false });
        emit('postSuccess');
      }
    })
    .catch((error) => {
      catchError(error);
    });
};

onMounted(() => {
  props.id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <label> 제목 :<input v-model="detail.noticeTitle" type="text" name="title" /> </label>
        <label> 내용 :<input v-model="detail.noticeContent" type="text" name="content" /> </label>
        파일 :
        <input id="fileInput" type="file" name="file" />
        <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>
        <div>
          <div>
            <label>미리보기</label>
            <img class="preview-image" />
          </div>
        </div>
        <div class="button-container">
          <button type="button" @click="!props.id ? handleSubmit() : updateHandler()">
            {{ props.id ? '수정' : '저장' }}
          </button>
          <button v-if="props.id" type="button" @click="deleteHandler">삭제</button>
          <button type="button" @click="modalState.$patch({ isOpen: false })">나가기</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>
