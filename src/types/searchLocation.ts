import CoordinatesT from "./coordinates";

interface SearchLocationT {
    city: string | null,
    states: string[] | null,
    geoBoundingBox: {
        top?: CoordinatesT,
        left?: CoordinatesT,
        bottom?: CoordinatesT,
        right?: CoordinatesT,
        bottom_left?: CoordinatesT,
        top_right?: CoordinatesT,
        bottom_right?: CoordinatesT,
        top_left?: CoordinatesT
    } | null,
    size: number,
    from: number,
}

export default SearchLocationT