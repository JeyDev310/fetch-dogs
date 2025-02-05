import axios from "axios";
import { BACKEND_BASE_URL } from "../constants";
import UserT from "../types/user";

const postLogin = (user: UserT) => {
    return new Promise((resolve, reject) => {
        axios.post(`${BACKEND_BASE_URL}/auth/login`, user, {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200)
                    resolve('resolved');
            })
            .catch((error) => {
                reject(error.message);
            });
    });
}

export {
    postLogin
}