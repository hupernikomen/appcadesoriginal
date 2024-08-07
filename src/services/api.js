// baseURL:"http://192.168.1.28:3333"


import axios from "axios";

const api = axios.create({
    // baseURL: "http://192.168.211.59:3333"
    // baseURL: "http://192.168.179.59:3333"
    baseURL:"http://192.168.0.103:3333"
})

export default api