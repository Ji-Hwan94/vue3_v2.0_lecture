<template>
  <div class="left-menu">
    <router-link to="/vue" class="logo-container">
      <img :src="logoImg" alt="happyjob" class="main-logo" />
    </router-link>

    <div class="profile-container">
      <img :src="logoImage" alt="logoImage" class="profile-img" />
      <div class="profile-info">
        <div class="user-id">{{ user.loginId }}</div>
        <button class="logout-btn" @click="handleLogout">로그아웃</button>
      </div>
    </div>

    <ul class="menu-list">
      <li v-for="menuAttrt in user.menus" :key="menuAttrt.mnuId" class="menu-item group">
        <div class="menu-header" :class="{ active: activeParent === menuAttrt.mnuId }">
          <img :src="menuIcon" alt="menu" class="menu-icon" />
          <div class="menu-title">{{ menuAttrt.mnuNm }}</div>
        </div>

        <div class="submenu-container" :class="{ flex: activeParent === menuAttrt.mnuId }">
          <router-link
            v-for="node in menuAttrt.childList"
            :key="node.mnuId"
            :to="`/vue${node.mnuUrl}`"
            class="submenu-item"
            :class="{ active: activeLink === node.mnuId }"
            @click="handleLinkClick(node.mnuId, menuAttrt.mnuId)"
          >
            <div :id="node.mnuId">{{ node.mnuNm }}</div>
          </router-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import logoImg from '@/assets/logo_img.png';
import logoImage from '@/assets/logo.svg';
import menuIcon from '@/assets/menu.png';
import { useUserInfo } from '@/stores/loginInfoState';

const router = useRouter();
const activeLink = ref(null);
const activeParent = ref(null);
const { user, setUserData } = useUserInfo();

onMounted(() => {
  const storedUserInfo = sessionStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      const parsedData = JSON.parse(storedUserInfo);
      setUserData(parsedData);
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
  }
  // activeParent, activeLink 쿠키 복원
  const savedParent = getCookie('activeParent');
  if (savedParent) {
    activeParent.value = savedParent;
  }
  const savedLink = getCookie('activeLink');
  if (savedLink) {
    activeLink.value = savedLink;
  }
});

const handleLinkClick = (menuId, parentId) => {
  activeLink.value = menuId;
  activeParent.value = parentId;
  setCookie('activeParent', parentId);
  setCookie('activeLink', menuId);
};

const handleLogout = async () => {
  try {
    await router.push('/');
    sessionStorage.removeItem('userInfo');
    deleteCookie('activeParent');
    deleteCookie('activeLink');
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
};

function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}
function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}
</script>

<style lang="css" scoped>
@import './styled.css';
</style>
