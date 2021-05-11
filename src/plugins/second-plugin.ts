import { definePlugin } from "@/base";

export default definePlugin({
  name: 'second-plugin',
  setup() {
      console.log('second plugin');
  }
})
