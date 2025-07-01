<script setup>
import { catchError } from '@/common/catchError';
import { useModalStore } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const modalState = useModalStore();
const formRef = ref();
const detail = ref({});
const imageUrl = ref('');
const isFileChanged = ref(false);

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

      // 파일 정보가 있으면 서버 API를 통해 이미지 URL 설정
      if (res.data.logicalPath) {
        // 서버에서 이미지를 제공하는 API 엔드포인트 사용
        imageUrl.value = `/api/common/getImage.do?path=${encodeURIComponent(res.data.logicalPath)}`;
      }
    })
    .catch((error) => {
      catchError(error);
    });
};

// formRef.value는 DOM 요소(form element)를 참조합니다
const handleSubmit = () => {
  const formData = new FormData(formRef.value);

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
  const formData = new FormData(formRef.value);
  console.log(props.id);
  formData.append('noticeId', props.id);

  // 파일이 변경되지 않았다면 파일 정보 제거
  if (!isFileChanged.value) {
    formData.delete('file');
  }

  // PATCH는 "일부만 수정" 용도이지만,
  // 실제로는 data에 담긴 모든 값이 서버로 전달됩니다.
  // 진짜 변경된 값만 보내고 싶다면, 직접 필터링해서 보내야 합니다.
  // 서버가 "값이 온 필드만 수정"하도록 구현되어 있다면,
  // 일부 필드만 보내도 정상 동작합니다.
  axios
    .patch('/api/support/noticeUpdate.do', formData)
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

const handleFileChange = (e) => {
  isFileChanged.value = true;
  const fileInfo = e.target.files;
  const fileInfoSplit = fileInfo[0].name.split('.');
  const fileExtension = fileInfoSplit[1].toLowerCase();

  if (fileExtension === 'jpg' || fileExtension === 'gif' || fileExtension === 'png') {
    imageUrl.value = URL.createObjectURL(fileInfo[0]);
  }
};

const downloadFile = () => {
  axios
    .get('/api/support/downloadFile.do', {
      params: { id: props.id },
      responseType: 'blob', // 파일 다운로드를 위해 blob으로 응답 받기
    })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', detail.value.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // 메모리 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('Download error:', error);
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
        <input id="fileInput" type="file" name="file" @change="handleFileChange" />
        <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>
        <div>
          <div @click="downloadFile">
            <label>미리보기</label>
            <img class="preview-image" :src="imageUrl" />
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
