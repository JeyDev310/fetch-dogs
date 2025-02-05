interface SearchQueryT {
    breeds: string[],
    zipCodes: string[],
    ageMin: number | null,
    ageMax: number | null,
    size: number | null,
    from: number | null,
    sort: string | null
}

export default SearchQueryT