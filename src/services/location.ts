import axios from "axios";
import { BACKEND_BASE_URL } from "../constants";
import SearchLocationT from "../types/searchLocation";

const fetchLocationsSearch = (location: SearchLocationT): Promise<any> => {
    return new Promise((resolve, reject) => {
        axios.post(`${BACKEND_BASE_URL}/locations/search`, location, {
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

export {
    fetchLocationsSearch
}