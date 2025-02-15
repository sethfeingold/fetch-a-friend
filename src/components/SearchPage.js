import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Container,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  Button,
  Box,
  FormControl,
  Modal,
  Grid2,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [breeds, setBreeds] = useState([]);
  const [dogs, setDogs] = useState();
  const [selectedBreeds, setselectedBreeds] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [pageCursor, setPageCursor] = useState(0);
  const [numResults, setNumResults] = useState(null);
  const [ascDesc, setAscDesc] = useState('asc');
  const [perfectMatch, setPerfectMatch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const NUM_PAGES = Math.ceil(numResults / 25)

  // Fetches list of breeds on page load
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get(
          'https://frontend-take-home-service.fetch.com/dogs/breeds',
          { withCredentials: true }
        );
        // Assuming response.data is an array of breed names.
        setBreeds(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching breeds:', error);
        // Redirect to login if unauthorized.
        if (error.response && error.response.status === 401) {
          navigate('/');
        } else {
          setLoading(false);
        }
      }
    };

    fetchBreeds();
  }, [navigate]);

  // Fetch dogs when selectedBreeds or pageCursor changes
  useEffect(() => {
    // If no breed is selected, clear the dogs list.
    if (!selectedBreeds || selectedBreeds.length === 0) {
      setDogs(null);
      return;
    }

    const fetchDogs = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        // Build query parameters.
        const params = { breeds: selectedBreeds, size: 25 };
        if (pageCursor) {
          params.from = pageCursor * 25;
        }
        if (ascDesc) {
          params.sort = `breed:${ascDesc}`
        }
        // Step 1: Get dog IDs
        const searchResponse = await axios.get(
          'https://frontend-take-home-service.fetch.com/dogs/search',
          {
            params,
            withCredentials: true,
          }
        );
        const dogIDs = searchResponse.data.resultIds;
        const totalResults = searchResponse.data.total;

        setNumResults(totalResults);
        // Step 2: Get full dog objects from the list of IDs.
        const dogsResponse = await axios.post(
          'https://frontend-take-home-service.fetch.com/dogs',
          dogIDs,
          { withCredentials: true }
        );
        setDogs(dogsResponse.data);
      } catch (err) {
        console.error('Error fetching dogs:', err);
        setErrorMessage('Failed to fetch dogs.');
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, [selectedBreeds, pageCursor, ascDesc]);

  // Send favorite ID's for perfect match
  const fetchPerfectMatch = async () => {
    try {
      const favoriteIds = favorites.map(dog => dog.id);

      const perfectMatchID = await axios.post(
        'https://frontend-take-home-service.fetch.com/dogs/match',
        favoriteIds,
        { withCredentials: true }
      );

      const perfectMatchDog = await axios.post(
        'https://frontend-take-home-service.fetch.com/dogs',
        [perfectMatchID.data.match],
        { withCredentials: true }
      );
      setPerfectMatch(perfectMatchDog.data[0]);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching dogs:', err);
      setErrorMessage('Failed to fetch dogs.');
    } finally {
      setLoading(false);
    }
  }

  // Logout handler.
  const handleLogout = async () => {
    try {
      await axios.post(
        'https://frontend-take-home-service.fetch.com/auth/logout',
        {},
        { withCredentials: true }
      );
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const GridItem = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    width: '100%',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
    '& img': {
    width: '100%',
    height: 'auto',
    },
  }));

  return (
    <>
      <AppBar position="static" sx={{ mb: 2, py: 2, background: 'white' }}>
        <Toolbar>
          <Typography variant="h4" sx={{ flexGrow: 1, color: 'primary.dark' }}>
            Welcome to Fetch-a-Friend!
          </Typography>

          {/* Dropdown for selecting a breed */}
          <FormControl variant="outlined" sx={{ minWidth: 200, maxWidth: 500, mr: 2 }}>
            <InputLabel 
              id="breed-select-label" 
              sx={{
                color: 'primary.dark',
                '&.Mui-focused': {
                  color: 'primary.dark',
                },
                '&.MuiInputLabel-shrink': {
                  color: 'primary.dark',
                },
                backgroundColor: '#fff',
                paddingRight: '0.5em'
              }}
            >
              Add Breed
            </InputLabel>
            <Select
              labelId="breed-select-label"
              id="breed-select"
              multiple
              value={selectedBreeds}
              onChange={(e) => {
                setselectedBreeds(e.target.value)
              }}
              label="Breed"
              sx={{
                bgcolor: 'white',
              }}
            >
              {/* Render an option for each breed */}
              {breeds.map((breed, index) => (
                <MenuItem key={index} value={breed}>
                  {breed}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Bar */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search dogs…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
              }}
            />
            <IconButton color="inherit" onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </Box> */}

          {/* Logout Button */}
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main content area */}
      <Container sx={{ mt: 3 }}>
        <>
          <Container sx={{ mt: 2, mb: 4 }}>
            {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>)}
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              
              {/* output list of selected breeds */}
              <Typography variant="p" gutterBottom sx={{color: 'primary.dark', fontWeight: 'bold'}}> 
                {selectedBreeds.length ? (
                  `Selected Breeds:`
                ) : (
                  `Select breeds from the dropdown above to help filter out your favorites!`
                )}
              </Typography>
              {selectedBreeds && (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: '1em', mt: 2}}>
                  {selectedBreeds.map((breed, index) => (
                    <Typography key={`${breed}-${index}`} variant="p" gutterBottom sx={{display: 'flex', flexWrap: 'no-wrap', alignItems: 'center', borderRadius: '4px', p: 1, color: 'primary.dark', border: '1px solid', borderColor: 'primary.dark', width: 'fit-content'}}> 
                      {breed} 
                      <Button 
                        variant="outlined" 
                        color="error" 
                        sx={{ml: 2}}
                        onClick={() => {
                          setselectedBreeds(selectedBreeds.filter((filterBreed) => breed !== filterBreed))}
                        }
                      >
                        X
                      </Button>
                    </Typography>
                  ))}
                </Box>
              )}

              {/* output list of favorites */}
              <Box mt={4}>
                <Typography variant="p" gutterBottom mt={2} sx={{color: 'primary.dark', fontWeight: 'bold'}}> 
                  {favorites.length  > 0 && (
                    `Favorite dogs:`
                  )}
                </Typography>
                {favorites.length > 0 && (
                  <>
                    <Box sx={{display: 'flex', gap: '1em', mt: 2}}>
                      {favorites.map((dog) => (
                        <Box key={`favorite-${dog.id}`} sx={{borderRadius: '4px', p: 1, color: 'primary.dark', border: '1px solid', borderColor: 'primary.dark', width: '90px'}}>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            sx={{ minWidth: 'unset', padding: '1px 5px', marginBottom: '0.2em', alignSelf: 'flex-end', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto'}}
                            onClick={() => {
                              setFavorites(favorites.filter((favorite) => favorite !== dog))}
                            }
                          >
                            X
                          </Button>
                          <Box>
                            <img
                              src={dog.img}
                              alt={`${dog.breed} named ${dog.name}`}
                              style={{ width: '100%', height: '64px', objectFit: 'cover' }}
                            />
                          </Box>
                          <Typography variant="p" gutterBottom> 
                            {dog.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box mt={2} sx={{display: 'flex', flexDirection: 'column'}}>
                      <Typography variant="p" mb={2}>
                        Click the button below in order to submit your chosen favorites and be shown your perfect match!
                      </Typography>
                      <Button onClick={fetchPerfectMatch} variant="contained" sx={{width: 'fit-content'}}>Fetch perfect match!</Button>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Container>
          {perfectMatch && (

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              <Box sx={{display: 'flex', flexDirection: 'column',maxWidth: '500px', backgroundColor: 'white', margin: '40px', padding: '40px', borderRadius: '4px', height: '80%'}}>
                <Typography variant="h2">
                  Congratulations!! We fetched your perfect match:
                </Typography>
                <Box>
                  <Box 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 2,
                      mb: 2,
                      cursor: 'pointer'
                    }} 
                  >
                    <Typography>
                      {perfectMatch.breed}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      overflow: 'hidden',
                      borderRadius: (theme) => theme.shape.borderRadius,
                    }}
                  >
                    <img
                      src={perfectMatch.img}
                      alt={`${perfectMatch.breed} named ${perfectMatch.name}`}
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ mt: 1, color: 'primary.dark' }}>
                    {perfectMatch.name}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: 'primary.dark' }}>
                    Age: {perfectMatch.age}
                  </Typography>
                  <Typography variant="p" sx={{ mt: 1, color: 'primary.dark' }}>
                    Zip Code: {perfectMatch.zip_code}
                  </Typography>
                </Box>
                <Button sx={{marginTop: '10px'}} onClick={() => setModalOpen(false)} variant='outlined' color='error'>close modal</Button>
              </Box>
            </Modal>
          )}
        {/* Render your search results or list of dogs */}
        {dogs && (
          <Container sx={{ mt: 2 }}>
            {loading ? (
          <Container sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Container>
        ): (
            <Container>
            {/* Ascending/Descending breed toggle */}
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 'auto'}}>
              <Typography variant='p' mb={2} sx={{fontWeight: 500}}>
                Order by Breed
              </Typography>
              <ToggleButtonGroup
                value={ascDesc}
                exclusive
                onChange={(e) => {
                  setAscDesc(e.target.value);
                }}
                aria-label="Toggle ascending / descending breed order"
              >
                <ToggleButton value="asc" aria-label="Ascending">
                  ⬆️ Ascending (A-Z)
                </ToggleButton>
                <ToggleButton value="desc" aria-label="Descending">
                  ⬇️ Descending (Z-A)
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {/* Top pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, gap: 2 }}>
              <Typography>
                Showing {pageCursor * 25 + 1} to {pageCursor + 1 === NUM_PAGES ? (numResults) : (pageCursor * 25 + 25)} of {numResults} results, page {pageCursor + 1} of {NUM_PAGES}
              </Typography>
              {/* remember to set disabled button logic! */}
              <Button disabled={pageCursor === 0} variant="contained" onClick={() => setPageCursor(pageCursor - 1)}>
                Previous
              </Button>
              <Button disabled={pageCursor + 1 === NUM_PAGES} variant="contained" onClick={() => setPageCursor(pageCursor + 1)}>
                Next
              </Button>
            </Box>
              <Grid2 container spacing={2}>
                {dogs
                  .map((dog) => (
                  <Grid2 key={dog.id} size={{ sm: 6, md: 4, xl: 3 }} sx={{display: 'flex', alignItems: 'stretch', width: '100%'}}>
                    <GridItem>
                      <Box 
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                          cursor: 'pointer'
                        }} 
                        onClick={() => {
                          if (!favorites.includes(dog)) {
                            setFavorites([...favorites, dog]);
                          } else {
                            setFavorites(favorites.filter(favorite => favorite !== dog));
                          }
                        }}
                      >
                        <Box sx={{width: '30px'}}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 117 112" fill="none">
                            <path d="M58.5 0L72.3076 42.4955H116.99L80.8412 68.7591L94.6488 111.255L58.5 84.9909L22.3512 111.255L36.1588 68.7591L0.010025 42.4955H44.6924L58.5 0Z" fill={favorites.includes(dog) ? '#FAFE38' : '#ffffff'} stroke="#000000"/>
                          </svg>
                        </Box>
                        <Typography>
                          {dog.breed}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          overflow: 'hidden',
                          borderRadius: (theme) => theme.shape.borderRadius,
                        }}
                      >
                        <img
                          src={dog.img}
                          alt={`${dog.breed} named ${dog.name}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography variant="h5" sx={{ mt: 1, color: 'primary.dark' }}>
                        {dog.name}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1, color: 'primary.dark' }}>
                        Age: {dog.age}
                      </Typography>
                      <Typography variant="p" sx={{ mt: 1, color: 'primary.dark' }}>
                        Zip Code: {dog.zip_code}
                      </Typography>
                    </GridItem>
                  </Grid2>
                ))}
              </Grid2>
            </Container>
            )}

            {/* Bottom pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, gap: 2 }}>
              {/* remember to set disabled button logic! */}
              <Button variant="contained" onClick={() => setPageCursor(pageCursor - 1)}>
                Previous
              </Button>
              <Button disabled={pageCursor + 1 === NUM_PAGES} variant="contained" onClick={() => setPageCursor(pageCursor + 1)}>
                Next
              </Button>
            </Box>
          </Container>
        )}
      </>
      </Container>
    </>
  );
};

export default SearchPage;
