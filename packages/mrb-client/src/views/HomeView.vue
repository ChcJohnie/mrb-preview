<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>My result board</h1>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/table">Table</RouterLink>
      </nav>
    </div>
  </header>
  <main>There will be event selection page here in the future</main>
</template>
