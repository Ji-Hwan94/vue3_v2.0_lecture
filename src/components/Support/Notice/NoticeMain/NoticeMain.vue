<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const noticeList = ref();
const noticeCount = ref(0);

const noticeSearch = (cPage) => {
  // cPage가 객체인지 확인하고 처리
  cPage = cPage || 1;

  const params = {
    ...route.query,
    pageSize: 5,
    currentPage: cPage,
  };

  axios.get('/api/support/noticeList.do', { params }).then((res) => {
    noticeList.value = res.data.list;
    noticeCount.value = res.data.count;
  });
};

onMounted(() => {
  noticeSearch();
});
// 현재 문제가 발생하는 이유는 watch 함수에서
// route.query의 변경을 감지할 때
// 전체 query 객체가 noticeSearch 함수의 cPage 파라미터로 전달되기 때문입니다.
watch(
  () => route.query,
  () => {
    noticeSearch(1);
  },
  { deep: true },
);
</script>

<template>
  <div class="notice-main-container">
    <table class="notice-table">
      <thead class="notice-table-header">
        <tr>
          <th>공지번호</th>
          <th>공지 제목</th>
          <th>공지 날짜</th>
          <th>작성자</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="noticeCount > 0">
          <tr v-for="notice in noticeList" :key="notice.noticeId" class="notice-table-row">
            <td class="notice-cell">{{ notice.noticeId }}</td>
            <td class="notice-cell cursor-pointer text-blue-600 hover:text-blue-800">
              {{ notice.noticeTitle }}
            </td>
            <td class="notice-cell">{{ notice.noticeRegDate.substr(0, 10) }}</td>
            <td class="notice-cell">{{ notice.loginId }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="notice-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="noticeCount" :items-per-page="5" :on-page-change="noticeSearch" />
  </div>
</template>

<style>
@import './styled.css';
</style>
