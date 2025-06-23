<script setup>
import router from '@/router';
import { onMounted, ref } from 'vue';

const searchTitle = ref('');
const searchStDate = ref('');
const searchEdDate = ref('');

const handlerSearch = () => {
  const query = [];
  !searchTitle.value || query.push(`searchTitle=${searchTitle.value}`);
  !searchStDate.value || query.push(`searchStDate=${searchStDate.value}`);
  !searchEdDate.value || query.push(`searchEdDate=${searchEdDate.value}`);
  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  router.push(queryString);
};

// 새로고침시 queryParam만 없애고 싶어요
// 1. 만약에, noticeSearch라는 컴포넌트가 열릴 때, url에 queryParam이 남아 있는지를 확인을 할겁니다
// 2. 남아 있는 경우, 경로(queryParam을 제외한 나머지)로 현재 url을 대체시킬겁니다.
onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
});
</script>

<template>
  <div class="notice-container">
    <div class="input-box">
      제목: <input v-model.lazy="searchTitle" />
      <input v-model="searchStDate" type="date" />
      <input v-model="searchEdDate" type="date" />
      <button @click="handlerSearch">검색</button>
      <button>등록</button>
    </div>
  </div>
</template>

<!-- style scoped는 해당 컴포넌트에서만 스타일을 적용시키는 방법이다.
    그러나, scoped는 컴파일 시점에 고유한 속성을 컴포넌트 요소에 추가하는데,
    외부 css 파일은 이 고유 속성을 알지 못하므로 스타일이 적용안된다.

    scoped을 사용하지 않고, css파일을 import 하거나, <style scoped> 안에 css를 구성해야한다.
-->
<style>
@import './styled.css';
</style>
