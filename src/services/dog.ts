import axios from "axios";
import { BACKEND_BASE_URL } from "../constants";
import SearchQueryT from "../types/search";
import DogT from "../types/dog";

const fetchBreeds = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        axios.get(`${BACKEND_BASE_URL}/dogs/breeds`, {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200 && response.data)
                    resolve(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    });
}

const fetchSearchDogs = (params: SearchQueryT): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        axios.get(`${BACKEND_BASE_URL}/dogs/search`, {
            params,
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200 && response.data)
                    resolve(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
    });
}

const fetchDogs = (ids: string[]): Promise<DogT[]> => {
    return new Promise((resolve, reject) => {
        axios.post(`${BACKEND_BASE_URL}/dogs`, ids, {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200 && response.data)
                    resolve(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
    });
}

const postMatch = (ids: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        axios.post(`${BACKEND_BASE_URL}/dogs/match`, ids, {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200 && response.data && response.data.match)
                    resolve(response.data.match);
            })
            .catch((error) => {
                console.log(error);
            })
    });
}

export {
    fetchBreeds,
    fetchSearchDogs,
    fetchDogs,
    postMatch
}