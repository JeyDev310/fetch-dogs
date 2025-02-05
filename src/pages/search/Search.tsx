import React, { useState, useEffect } from "react";
import { 
    Card, 
    Row, 
    Col, 
    Select, 
    Input, 
    Slider,
    Button, 
    Checkbox, 
    Spin, 
    Pagination, 
    Modal, 
    Table
 } from 'antd';
import {
    HeartOutlined,
    UpSquareFilled
} from '@ant-design/icons';
import { debounce } from "lodash";
import { useAuth } from "../../context/AuthContext";
import { fetchBreeds, fetchSearchDogs, fetchDogs, postMatch } from "../../services/dog";
import { fetchLocationsSearch  } from "../../services/location";
import DogT from "../../types/dog";
import LocationT from "../../types/location";
import SearchLocationT from "../../types/searchLocation";
import logImg from "../../assets/imgs/logo.svg";

const { Meta } = Card;
const { Option } = Select;

const locationColumns = [
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Latitue', dataIndex: 'latitude', key: 'latitude' },
    { title: 'Longitude', dataIndex: 'longitude', key: 'longitude' },
    { title: 'Zip Code', dataIndex: 'zipCode', key: 'zipCode' }
];

const states = [
    "AL", "AK", "AZ", "AR", "AS", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP",
    "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "TT", "UT", "VT", "VA", "VI", "WA", "WV", "WI", "WY"
];

const Search: React.FC = () => {
    const { logout } = useAuth();
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
    const [dogs, setDogs] = useState<DogT[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [size, setSize] = useState<number>(25);
    const [from, setFrom] = useState<number>(0);
    const [ageMin, setAgeMin] = useState<number>(0);
    const [ageMax, setAgeMax] = useState<number>(30);
    const [zipCodes, setZipCodes] = useState<string[]>([]);
    const [sortField, setSortField] = useState<string>("breed");
    const [sortDirection, setSortDirection] = useState<string>("asc");
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isShowLocationModal, setIsShowLocationModal] = useState<boolean>(false);
    const [locations, setLocations] = useState<LocationT[]>([]);
    const [locationRows, setLocationRows] = useState<any[]>([]);
    const [selectedLocationRowKeys, setSelectedLocationRowKeys] = useState<string[]>([]);
    const [locationsTotal, setLocationsTotal] = useState<number>(0);
    const [locationsTotalPages, setLocationsTotalPages] = useState<number>(0);
    const [locationsPage, setLocationsPage] = useState<number>(1);
    const [location, setLocation] = useState<SearchLocationT>({
        city: null,
        states: null,
        geoBoundingBox: null,
        size: 10,
        from: 0
    });
    const [useLocationIndex, setUseLocationIndex] = useState<number>(0);
    const [favoritedDogs, setFavoritedDogs] = useState<DogT[]>([]);
    const [isShowMatchModal, setIsShowMatchModal] = useState<boolean>(false);
    const [matchId, setMatchId] = useState<string|null>(null);
    const [matchIndex, setMatchIndex] = useState<number>(-1);
    const [isShowFavoritesModal, setIsShowFavoritesModal] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Handler to select locations
     */
    const locationRowSelection = {
        selectedLocationRowKeys,
        onChange: (selectedKeys: any) => {
            setSelectedLocationRowKeys([...selectedKeys]);
        },
    };

    /**
     * Hook for mount
     */
    useEffect(() => {
        fetchBreeds()
            .then((data: string[]) => {
                setBreeds(data);
            })
            .catch(error => {

            });
    }, [])

    /**
     * Hook for size and total updates
     * set total pages number with total and size
     */
    useEffect(() => {
        setTotalPages(Math.floor(total / size));
    }, [size, total])

    /**
     * Hook for page update
     * set From value with page number and size
     */
    useEffect(() => {
        setFrom((page - 1) * size);
    }, [page, size])

    /**
     * Hook
     * call search dogs function
     */
    useEffect(() => {
        searchDogs();
    }, [selectedBreeds, sortField, sortDirection, size, from])

    useEffect(() => {
        const handler = setTimeout(() => {
            searchDogs();
        }, 300);
        return () => clearTimeout(handler);
    }, [ageMin, ageMax])

    /**
     * Hook for locations update
     * Initialize Location Rows
     */
    useEffect(() => {
        let newLocationRows: any[] = [];
        if (locations) {
            locations.forEach((location, index) => {
                newLocationRows.push({
                    key: index,
                    country: location.county,
                    city: location.city,
                    state: location.state,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    zipCode: location.zip_code
                });
            })
        }
        setLocationRows(newLocationRows);
    }, [locations])

    /**
     * Hook for selectedLocationRowKeys
     * set zip codes from the selected location row keys
     */
    useEffect(() => {
        const newZipCodes: string[] = [];
        selectedLocationRowKeys.forEach(key => {
            newZipCodes.push(locations[Number(key)].zip_code);
        });
        setZipCodes(newZipCodes);
    }, [selectedLocationRowKeys, locations])

    /**
     * Hook for locationsTotal and location
     * set locations total pages with location total and location
     */
    useEffect(() => {
        setLocationsTotalPages(Math.floor(locationsTotal / location.size));
    }, [locationsTotal, location])

    /**
     * Hook for locationsPage update
     * set location with the locationsPage and location page size
     */
    useEffect(() => {
        setLocation((prev) => ({
            ...prev,
            from: (locationsPage - 1) * location.size,
        }));
    }, [locationsPage, location.size])

    useEffect(() => {
        searchLocations();
    }, [location])

    useEffect(() => {
        if (matchId) {
            const index = dogs.findIndex(dog => dog.id === matchId)
            setMatchIndex(index);
        }
    }, [matchId, dogs])

    /**
     * Search Locations Function
     * call locations search API
     */
    const searchLocations = () => {
        const searchLocation = { ...location };
        if (useLocationIndex === 0) {
            if (!location?.geoBoundingBox?.top?.lat 
                || !location?.geoBoundingBox?.top?.lon
                || !location?.geoBoundingBox?.left?.lat
                || !location?.geoBoundingBox?.left?.lon
                || !location?.geoBoundingBox?.bottom?.lat
                || !location?.geoBoundingBox?.bottom?.lon
                || !location?.geoBoundingBox?.right?.lat
                || !location?.geoBoundingBox?.right?.lon
            ) {
                searchLocation.geoBoundingBox = null;
            }
        } else if (useLocationIndex === 1) {
            if (!location?.geoBoundingBox?.bottom_left?.lat
                || !location?.geoBoundingBox?.bottom_left?.lon
                || !location?.geoBoundingBox?.top_right?.lat
                || !location?.geoBoundingBox?.top_right?.lon
            ) {
                searchLocation.geoBoundingBox = null;
            }
        } else if (useLocationIndex === 2) {
            if (!location?.geoBoundingBox?.bottom_right?.lat
                || !location?.geoBoundingBox?.bottom_right?.lon
                || !location?.geoBoundingBox?.top_left?.lat
                || !location?.geoBoundingBox?.top_left?.lon
            ) {
                searchLocation.geoBoundingBox = null;
            }
        }
        
        fetchLocationsSearch(searchLocation)
            .then(data => {
                setLocationsTotal(data.total);
                setLocations(data.results);
            })
            .catch(error => {

            });
    }

    /**
     * Function to search dogs
     * call dogs search api
     */
    const searchDogs = () => {
        setIsLoading(true);
        fetchSearchDogs({
            breeds: selectedBreeds,
            zipCodes,
            ageMax,
            ageMin,
            from,
            size,
            sort: `${sortField}:${sortDirection}`
        })
            .then((data: any) => {
                setTotal(data.total);
                fetchDogs(data.resultIds)
                    .then((data) => {
                        setIsLoading(false);
                        setDogs(data);
                    }).catch((error) => {
                        setIsLoading(false);
                    })
            })
            .catch((error) => {

            })
    }

    /**
     * Handler for Breeds Change
     * @param values string[]
     */
    const handleBreedsChange = (values: string[]) => {
        setSelectedBreeds(values);
    };

    /**
     * Handler for location change
     * @param value any
     * @param field string
     * @param subField string | null
     * @param isLat boolean | null
     */
    const handleLocationChange = (value: any, field: string, subField: string | null, isLat: boolean | null) => {
        if (field === "city") {
            setLocation((prev) => ({
                ...prev,
                city: value === "" ? null : value,
            }));
        } else if (field === "states") {
            setLocation((prev) => ({
                ...prev,
                states: value.length === 0 ? null : value,
            }));
        } else if (field === "geoBoundingBox") {
            let newCoordinate: any = {};
            let newGeoBoundingBox: any = {};

            if (subField && location.geoBoundingBox)
                newCoordinate = location.geoBoundingBox[subField as keyof typeof location.geoBoundingBox];
            
            if (!newCoordinate)
                newCoordinate = {};

            if (isLat)
                newCoordinate.lat = Number(value);
            else
                newCoordinate.lon = Number(value);

            if (useLocationIndex === 0) {
                if (location.geoBoundingBox) {
                    newGeoBoundingBox = {
                        top: location.geoBoundingBox.top,
                        left: location.geoBoundingBox.left,
                        bottom: location.geoBoundingBox.bottom,
                        right: location.geoBoundingBox.right
                    }
                }
                if (subField) {
                    newGeoBoundingBox = {
                        ...newGeoBoundingBox,
                        [subField]: newCoordinate
                    };  
                }
            } else if (useLocationIndex === 1) {
                if (location.geoBoundingBox) {
                    newGeoBoundingBox = {
                        bottom_left: location.geoBoundingBox.bottom_left,
                        top_right: location.geoBoundingBox.top_right
                    }
                }
                if (subField) {
                    newGeoBoundingBox = {
                        ...newGeoBoundingBox,
                        [subField]: newCoordinate
                    };
                }
            } else if (useLocationIndex === 2) {
                if (location.geoBoundingBox) {
                    newGeoBoundingBox = {
                        bottom_right: location.geoBoundingBox.bottom_right,
                        top_left: location.geoBoundingBox.top_left
                    }
                }
                if (subField) {
                    newGeoBoundingBox = {
                        ...newGeoBoundingBox,
                        [subField]: newCoordinate
                    };
                }
            }

            setLocation((prev) => ({
                ...prev,
                geoBoundingBox: newGeoBoundingBox
            }));
        }
    };

    /**
     * 
     * @param id dog id
     * @param dogIndex dog index
     */
    const handleAddFavorite = (id: string, dogIndex: number) => {
        const index = favoritedDogs.findIndex((dog: DogT) => dog.id === id);
        if (index > -1) {
            const newFavoritedDogs = [...favoritedDogs];
            newFavoritedDogs.splice(index, 1);
            setFavoritedDogs(newFavoritedDogs);
        } else {
            setFavoritedDogs([...favoritedDogs, dogs[dogIndex]]);
        }
    }

    /**
     * Function to rest all filters
     */
    const reset = () => {
        setSelectedBreeds([]);
        setAgeMin(0);
        setAgeMax(30);
        setSortField("breed");
        setSortDirection("asc");
        setZipCodes([]);
    }

    /**
     * Function for match
     * @returns void
     */
    const match = () => {
        if (favoritedDogs.length === 0) {
            return alert("Add dogs into your favorite!");
        }

        const favoritedDogIds: string[] = [];
        favoritedDogs.forEach(dog => {
            if (dog && dog.id) {
                favoritedDogIds.push(dog.id);
            }
        });

        setIsLoading(true);

        postMatch(favoritedDogIds)
            .then((id: string) => {
                setIsLoading(false);
                setMatchId(id);
                setIsShowMatchModal(true);
            })
            .catch(error => {
                setIsLoading(false);
                console.log(error);
            });
    }

    return (
        <div className="search-page">
            <div className="filter-section">
                <div className="filter-logo">
                    <img src={logImg} alt="logo" />
                </div>
                <div className="filter-item">
                    <span>Breeds: </span> &nbsp;
                    <Select
                        className="select-breeds"
                        mode="multiple"
                        placeholder="Select items"
                        value={selectedBreeds}
                        onChange={handleBreedsChange}
                    >
                        {breeds.map(breed => {
                            return (
                                <Option value={breed} key={breed}>{breed}</Option>
                            )
                        })}
                    </Select>
                </div>
                <div className="filter-item">
                    <span>Min Age: </span> &nbsp;
                    <Slider 
                        className="age-slider" 
                        range
                        min={0}
                        max={30}
                        value={[ageMin, ageMax]}
                        onChange={(value) => {
                            setAgeMin(value[0]);
                            setAgeMax(value[1]);
                        }}
                    />
                </div>
                <div className="filter-item">
                    <span>Sort Field: </span>
                    &nbsp;
                    <Select
                        className="select-sort"
                        placeholder="Select Sort Field"
                        value={sortField}
                        onChange={(value: string) => setSortField(value)}
                    >
                        <Option value="breed">Breed</Option>
                        <Option value="name">Name</Option>
                        <Option value="age">Age</Option>
                    </Select>
                </div>
                <div className="filter-item">
                    <span>Sort Direction: </span>
                    &nbsp;
                    <Select
                        className="select-sort"
                        placeholder="Select Sort Direction"
                        value={sortDirection}
                        onChange={(value: string) => setSortDirection(value)}
                    >
                        <Option value="asc">Ascending</Option>
                        <Option value="desc">Descending</Option>
                    </Select>
                </div>
                <div className="filter-item">
                    <Button type="primary" onClick={() => setIsShowLocationModal(true)}>
                        Filter By ZipCodes(Locations)
                    </Button>
                </div>
                <div className="filter-item">
                    <Button type="primary" onClick={reset}>
                        Reset
                    </Button>
                </div>
                <div className="filter-item">
                    <Button type="primary" onClick={match}>
                        Match
                    </Button>
                </div>
                <div className="filter-item">
                    <Button type="primary" onClick={() => setIsShowFavoritesModal(true)}>
                        Favorites
                    </Button>
                </div>
                <div className="filter-item">
                    <Button type="primary" onClick={logout}>
                        Log Out
                    </Button>
                </div>
                {dogs && dogs.length > 0 &&
                    <div className="filter-pagination">
                        <span>Results Per Page</span>: &nbsp;
                        <Select
                            className="select-sort"
                            placeholder="Select Sort Direction"
                            value={String(size)}
                            onChange={(value: string) => setSize(Number(value))}
                        >
                            <Option value={25}>25</Option>
                            <Option value={50}>50</Option>
                            <Option value={100}>100</Option>
                        </Select>
                        &nbsp;
                        <Pagination
                            className="pagination"
                            current={page}
                            total={totalPages}
                            showSizeChanger={false}
                            onChange={(page) => setPage(page)}
                        />
                        &nbsp;
                        <span>Total Results</span>: &nbsp;
                        <span>{total}</span>
                    </div>
                }
            </div>
            <div className="cards-container">
                <Row gutter={16}>
                    {dogs.map((dog, index) => (
                        <Col
                            className="card-item"
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={4}
                            key={index}
                        >
                            <Card
                                hoverable
                                cover={<img alt={dog.name} src={dog.img} />}
                            >
                                <Meta
                                    title={dog.name}
                                    description={<div>
                                        <b>Age</b>: {dog.age} &nbsp;
                                        <b>Zip Code</b>: {dog.zip_code} &nbsp;
                                        <b>Breed</b>: {dog.breed} &nbsp;
                                    </div>}
                                />
                                <br />
                                <Button
                                    className="btn-favorite"
                                    color="danger"
                                    shape="circle"
                                    icon={<HeartOutlined />}
                                    variant={favoritedDogs.findIndex(favoritedDog => favoritedDog.id === dog.id) > -1 ? "solid" : "outlined"}
                                    onClick={() => handleAddFavorite(dog.id, index)}
                                ></Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
            <Modal 
                title="Filter By ZipCodes & Locations" 
                style={{ top: 20 }}
                open={isShowLocationModal}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
                onCancel={() => setIsShowLocationModal(false)}
                onOk={() => {
                    searchDogs();
                    setIsShowLocationModal(false);
                }}
            >
                <div className="locations-info">
                    <div className="location-input">
                        <span>City: </span>
                        &nbsp;
                        <Input type="text" name="city" onChange={debounce((e: any) => {handleLocationChange(e.target.value, "city", null, null)}, 500)} />
                    </div>
                    &nbsp;&nbsp;&nbsp;
                    <div className="location-input">
                        <span>State: </span>
                        &nbsp;
                        <Select
                            className="select-states"
                            mode="multiple"
                            placeholder="Select States"
                            onChange={(values) => handleLocationChange(values, "states", null, null)}
                        >
                            {states.map(state => {
                                return (
                                    <Option value={state} key={state}>{state}</Option>
                                )
                            })}
                        </Select>
                    </div>
                    &nbsp;&nbsp;&nbsp;
                </div>
                <div className="location-info">
                    <Checkbox
                        checked={useLocationIndex === 1}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setUseLocationIndex(1);
                            }
                        }}
                    >
                        Use This for location
                    </Checkbox>
                </div>
                <div className="location-info">
                    <div className="location-input">
                        <span>Bottom Left Lat: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="bottom-left-lat"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "bottom_left", true), 500)}
                        />
                    </div>
                    <div className="location-input">
                        <span>Bottom Left Lon: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="bottom-left-lon"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "bottom_left", false), 500)}
                        />
                    </div>
                    <div className="location-input">
                        <span>Top Right Lat: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="top-right-lat"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "top_right", true), 500)}
                        />
                    </div>
                    <div className="location-input">
                        <span>Top Right Lon: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="top-right-lon"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "top_right", false), 500)}
                        />
                    </div>
                </div>
                <br />
                <div className="location-info">
                    <Checkbox
                        name="use-location"
                        checked={useLocationIndex === 2}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setUseLocationIndex(2);
                            }
                        }}
                    >
                        Use This for location
                    </Checkbox>
                </div>
                <div className="location-info">
                    <div className="location-input">
                        <span>Bottom Right Lat: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="bottom-right-lat"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "bottom_right", true), 500)}
                        />
                    </div>
                    <div className="location-input">
                        <span>Bottom Right Lon: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="bottom-right-lon"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "bottom_right", false), 500)}
                        />
                    </div>
                    <div className="location-input">
                        <span>Top Left Lat: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="top-left-lat"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "top_left", true), 500)}
                        />
                    </div>
                    <div className="location-input">
                        <span>Top Left Lon: </span>
                        &nbsp;
                        <Input
                            type="text"
                            name="top-left-lon"
                            onChange={debounce((e) => handleLocationChange(e.target.value, "geoBoundingBox", "top_left", false), 500)}
                        />
                    </div>
                </div>
                <Table
                    className="locaions-table"
                    columns={locationColumns}
                    dataSource={locationRows}
                    rowSelection={locationRowSelection}
                    pagination={{
                        current: locationsPage,
                        pageSize: location.size,
                        total: locationsTotalPages,
                        showSizeChanger: false,
                        onChange: (page) => setLocationsPage(page),
                    }}
                    scroll={{ x: 'max-content' }}
                />
            </Modal>
            <Modal
                title="Match Dogs!"
                style={{ top: 20 }}
                open={isShowMatchModal}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
                onCancel={() => setIsShowMatchModal(false)}
                onOk={() => setIsShowMatchModal(false)}
            >
                {dogs && dogs.length > 0 && matchIndex > -1 &&
                    <Card
                        className="match-card"
                        hoverable
                        cover={<img alt={dogs[matchIndex].name} src={dogs[matchIndex].img} />}
                    >
                        <Meta
                            title={dogs[matchIndex].name}
                            description={`Age: ${dogs[matchIndex].age}, Zip Code: ${dogs[matchIndex].zip_code} breed: ${dogs[matchIndex].breed}`}
                        />
                    </Card>
                }
            </Modal>
            <Modal
                title="Favorite Dogs!"
                style={{ top: 20 }}
                open={isShowFavoritesModal}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                }}
                onCancel={() => setIsShowFavoritesModal(false)}
                onOk={() => setIsShowFavoritesModal(false)}
            >
                <Row gutter={16}>
                    {favoritedDogs.map((dog, index) => (
                        <Col
                            className="card-item"
                            xs={24}
                            sm={24}
                            md={12}
                            lg={12}
                            xl={8}
                            key={index}
                        >
                            <Card
                                hoverable
                                cover={<img alt={dog.name} src={dog.img} />}
                            >
                                <Meta
                                    title={dog.name}
                                    description={<div>
                                        <b>Age</b>: {dog.age} &nbsp;
                                        <b>Zip Code</b>: {dog.zip_code} &nbsp;
                                        <b>Breed</b>: {dog.breed} &nbsp;
                                    </div>}
                                />
                                <br />
                                <Button
                                    className="btn-favorite"
                                    color="danger"
                                    shape="circle"
                                    icon={<HeartOutlined />}
                                    variant={"solid"}
                                    onClick={() => handleAddFavorite(dog.id, index)}
                                ></Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Modal>
            <UpSquareFilled className="scrollTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            {isLoading && <Spin className="loadingSpin" size="large" />}
        </div>
    )
}

export default Search