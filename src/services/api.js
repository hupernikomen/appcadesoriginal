import axios from "axios";

const api = axios.create({

    // baseURL:"http://192.168.0.104:3333"
    baseURL:"https://cadesapi.onrender.com"

    // npx react-native build-android --mode=release
})

export default api