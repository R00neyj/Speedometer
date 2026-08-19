<script setup>
defineProps({
  isSmall: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <!-- absolute inset-0 이므로 위치를 잡아주는 부모(relative)가 곧 이 글로우의 크기와 위치를 정한다.
       각 뷰가 자기 컨테이너 안에 직접 배치해야 하고, v-if 바깥으로 끌어올리면 안 된다. -->
  <div class="absolute inset-0 flex items-center justify-center -z-10">
    <div
      :class="[isSmall ? 'w-48 h-48' : 'w-64 h-64']"
      class="bg-primary-container/10 rounded-full blur-[60px] md:blur-[80px]"
    ></div>
  </div>
</template>
