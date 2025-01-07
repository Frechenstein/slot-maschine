<template>
  <div id="app">
    <h1>Slot Machine</h1>
    <SlotMachine />
  </div>
</template>

<script>
import SlotMachine from './components/SlotMaschine.vue';

export default {
  name: 'App',
  components: {
    SlotMachine,
  },
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  text-align: center;
  background-color: #222;
  color: #fff;
  margin: 0;
  padding: 0;
}
</style>
