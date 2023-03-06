<script setup lang="ts">
import DataProvider from '@/components/DataProvider.vue'
import CompetitionList from '@/components/CompetitionList.vue'
</script>

<template>
  <div class="grid home-layout gap-y-10 font-mrb">
    <header class="header text-center mt-10">
      <h1 class="text-4xl font-bold">
        <span class="text-header">My</span
        ><span class="text-female">Result</span
        ><span class="text-male">Board</span>
      </h1>
      <p class="text-xl capitalize">Technology Preview</p>
      <p class="mt-6 text-3xl font-semibold">
        Orienteering competitions result board
      </p>
    </header>
    <main
      class="competition-list w-140 justify-self-center lg:justify-self-end lg:pr-4 lg:border-r-3 lg:border-female"
    >
      <DataProvider provider="liveResultat">
        <CompetitionList />
      </DataProvider>
    </main>
    <section class="about flex flex-col gap-4 w-140 text-lg lg:pl-8">
      <h2 class="text-2xl font-semibold uppercase text-header">About MRB</h2>
      <p>
        MyResultBoard is competition result presentation system intended for use
        on result screens in the competition centre. MRB is created by
        orienteering runners for orienteering events but should be modular and
        easily extensible for other time-based sports.
      </p>
      <p>
        This Preview version offers a basic result board on top of LiveResultat
        API with limited functionality and configuration. Still as is, it should
        be possible to display orienteering event results. The full version
        shall be released in the future.
      </p>
      <p>Upcoming features may include:</p>
      <ul class="list-disc list-inside">
        <li>persistent competition settings (local or online)</li>
        <li>multiple competition data providers</li>
        <li>multiple columns support</li>
        <li>multi screen/device synchronization (settings/takeover mode)</li>
        <li>relay mode</li>
        <li>richer data content options</li>
        <li>and many more</li>
      </ul>
      <p>
        Its recommended to use Chrome as browser. StartTimes and LiveTime
        calculation (if available for competition) might be off out of CET time
        zone (known bug which shall be fixed in future release)
      </p>
    </section>
    <footer class="footer text-center text-xl bg-slate-300 p-10">
      <h2>@MyResultBoard - Contact us</h2>
      <a href="https://github.com/ChcJohnie/myresultboard2"
        ><span class="i-mdi-github">GitHub</span></a
      >
    </footer>
  </div>
</template>

<style scoped>
.header {
  grid-area: header;
}
.competition-list {
  grid-area: main;
}
.about {
  grid-area: about;
}
.footer {
  grid-area: footer;
}

.home-layout {
  grid-template-areas:
    'header'
    'main'
    'about'
    'footer';
}

@media (min-width: 1024px) {
  .home-layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'header   header'
      'main     about'
      'footer   footer';
  }
}
</style>
