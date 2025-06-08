import {
  Box,
  Flex,
  Image,
  IconButton,
  Text,
  useColorModeValue,
  Stack,
  Button,
  HStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  Select,
  Progress,
  useToast,
  Link as ChakraLink
} from '@chakra-ui/react';
import { Pause, Play, Trash, Search, List, X } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Music = () => {
  const [artistsData, setArtistsData] = useState<any>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<any>(null);
  const [playedTracks, setPlayedTracks] = useState<any>([]);
  const [accessToken, setAccessToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [progress, setProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = '#121212';
  const cardBgColor = useColorModeValue('gray.800', 'gray.700');
  const textColor = 'white';
  const accentColor = 'teal.400';
  const fallbackImage = 'https://via.placeholder.com/50';

  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID_API_KEY;
  const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_SECRET_ID_API_KEY;
  const ARTISTS = ['BTS', 'IU'];

  // Helper function to format duration (ms to mm:ss)
  const formatDuration = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Fetch Spotify Access Token
  useEffect(() => {
    const getAccessToken = async () => {
      const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
      try {
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        setAccessToken(response.data.access_token);
        console.log('액세스 토큰 발급 성공:', response.data.access_token);
      } catch (error) {
        console.error('액세스 토큰 발급 오류:', error.response?.data || error.message);
      }
    };
    getAccessToken();
  }, []);

  // Fetch Artists Data
  useEffect(() => {
    const fetchArtistsData = async (artistNames) => {
      if (!accessToken) return;
      const allArtistsData = [...artistsData];
      for (const artistName of artistNames) {
        if (allArtistsData.some((data) => data.artist.toLowerCase() === artistName.toLowerCase())) {
          continue;
        }
        try {
          const artistResponse = await axios.get(
            `https://api.spotify.com/v1/search`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { q: artistName, type: 'artist', limit: 1 },
            }
          );
          const artist = artistResponse.data.artists.items[0];
          if (!artist) {
            console.warn(`아티스트를 찾을 수 없음: ${artistName}`);
            continue;
          }

          const albumsResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artist.id}/albums`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { limit: 10, include_groups: 'album,single' },
            }
          );
          const albums = albumsResponse.data.items;

          const topTracksResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { market: 'KR' },
            }
          );
          let topTracks = topTracksResponse.data.tracks;

          const albumsWithTracks = await Promise.all(
            albums.map(async (album) => {
              const tracksResponse = await axios.get(
                `https://api.spotify.com/v1/albums/${album.id}/tracks`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                  params: { limit: 20 },
                }
              );
              return { ...album, tracks: tracksResponse.data.items };
            })
          );

          allArtistsData.push({
            artist: artist.name,
            albums: albumsWithTracks,
            topTracks,
          });
        } catch (error) {
          console.error(`데이터 가져오기 오류 (${artistName}):`, error.response?.data || error.message);
        }
      }
      setArtistsData(allArtistsData);
      console.log('가져온 아티스트 데이터:', allArtistsData);
    };
    fetchArtistsData(ARTISTS);
  }, [accessToken]);

  // Load Played Tracks from LocalStorage
  useEffect(() => {
    const savedTracks = localStorage.getItem('playedTracks');
    if (savedTracks) setPlayedTracks(JSON.parse(savedTracks));
  }, []);

  // Handle Search Submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newArtists = [searchQuery.trim()];
      setArtistsData((prev) =>
        prev.filter((data) => !newArtists.includes(data.artist.toLowerCase()))
      );
      fetchArtistsData(newArtists);
      setSearchQuery('');
    }
  };

  // Handle Enter key for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Fetch Artists Data for Search
  const fetchArtistsData = async (artistNames) => {
    let allArtistsData = [...artistsData];
    for (const artistName of artistNames) {
      if (allArtistsData.some((data) => data.artist.toLowerCase() === artistName.toLowerCase())) {
        continue;
      }
      try {
        const artistResponse = await axios.get(
          `https://api.spotify.com/v1/search`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { q: artistName, type: 'artist', limit: 1 },
          }
        );
        const artist = artistResponse.data.artists.items[0];
        if (!artist) {
          console.warn(`아티스트를 찾을 수 없음: ${artistName}`);
          continue;
        }

        const albumsResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${artist.id}/albums`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 10, include_groups: 'album,single' },
          }
        );
        const albums = albumsResponse.data.items;

        const topTracksResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { market: 'KR' },
          }
        );
        let topTracks = topTracksResponse.data.tracks;

        const albumsWithTracks = await Promise.all(
          albums.map(async (album) => {
            const tracksResponse = await axios.get(
              `https://api.spotify.com/v1/albums/${album.id}/tracks`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { limit: 20 },
              }
            );
            return { ...album, tracks: tracksResponse.data.items };
          })
        );

        allArtistsData = [{
          artist: artist.name,
          albums: albumsWithTracks,
          topTracks,
        }, ...allArtistsData];
      } catch (error) {
        console.error(`데이터 가져오기 오류 (${artistName}):`, error.response?.data || error.message);
      }
    }
    setArtistsData(allArtistsData);
  };

  // Update Playback Progress
  useEffect(() => {
    if (audio && isPlaying) {
      const updateProgress = () => {
        setProgress((audio.currentTime / (audio.duration || 30)) * 100);
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, [audio, isPlaying]);

  // Handle Play
  const handlePlay = (track) => {
    console.log('재생 시도:', track.name);
    // Add track to playlist regardless of preview_url
    if (!playedTracks.find((t) => t.id === track.id)) {
      const updatedPlayedTracks = [...playedTracks, track];
      setPlayedTracks(updatedPlayedTracks);
      localStorage.setItem('playedTracks', JSON.stringify(updatedPlayedTracks));
      console.log('재생 목록에 추가:', track.name);
      toast({
        title: '재생 목록에 추가했습니다',
        description: `${track.name}을(를) 재생 목록에 추가했습니다.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }

    setCurrentTrack(track); // Always set currentTrack to update playback bar

    if (!track.preview_url) {
      console.warn('이 트랙은 미리듣기를 지원하지 않습니다:', track.name);
      setIsPlaying(false); // Ensure not playing if no preview
      return;
    }

    playTrack(track);
  };

  const playTrack = (track) => {
    if (audio) audio.pause();
    const newAudio = new Audio(track.preview_url);
    newAudio.play()
      .then(() => {
        console.log('재생 시작:', track.name);
        setTimeout(() => {
          if (newAudio && !newAudio.paused) {
            newAudio.pause();
            setIsPlaying(false);
            setProgress(0);
            console.log('30초 미리듣기 종료:', track.name);
          }
        }, 30000);
      })
      .catch((error) => {
        console.error('재생 실패:', error.message);
      });
    newAudio.loop = false;
    newAudio.volume = 0.5;
    setAudio(newAudio);
    setIsPlaying(true);
    setProgress(0);

    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
      setProgress(0);
    };
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleDelete = (trackId) => {
    const updatedPlayedTracks = playedTracks.filter((t) => t.id !== trackId);
    setPlayedTracks(updatedPlayedTracks);
    localStorage.setItem('playedTracks', JSON.stringify(updatedPlayedTracks));
    toast({
      title: '트랙 삭제',
      description: '재생 목록에서 트랙을 삭제했습니다.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearPlaylist = () => {
    setPlayedTracks([]);
    localStorage.removeItem('playedTracks');
    toast({
      title: '재생 목록 초기화',
      description: '재생 목록이 초기화되었습니다.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Sort Tracks
  const sortedTracks = (tracks) => {
    if (sortOption === 'name') {
      return [...tracks].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'popularity') {
      return [...tracks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortOption === 'duration') {
      return [...tracks].sort((a, b) => (a.duration_ms || 0) - (b.duration_ms || 0));
    }
    return tracks;
  };

  return (
    <Box bg={bgColor} minHeight="100vh" p={4} pb={40} position="relative" overflow="hidden">
      <Flex
        position="sticky"
        top={0}
        zIndex={3}
        bg={bgColor}
        p={2}
        mb={10}
        alignItems="center"
        justifyContent="space-between"
        boxShadow="sm"
      >
        <ChakraLink as={Link} to="/" onClick={() => navigate('/')}>
          <Image src="/logo.png" w="100px" />
        </ChakraLink>
        <Flex gap={4}>
          <Input
            placeholder="아티스트 검색 (예: BTS)"
            size="sm"
            w={{ base: '150px', md: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            borderRadius="full"
            bg={cardBgColor}
            color={textColor}
            _placeholder={{ color: 'gray.500' }}
          />
          <IconButton
            icon={<Search />}
            aria-label="Search"
            onClick={handleSearch}
            variant="ghost"
            colorScheme="teal"
            size="sm"
          />
          <ChakraLink
            as={Link}
            to="/login"
            color="#38b2ac"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline', color: '#2c928d' }}
          >
            로그인
          </ChakraLink>
          <ChakraLink
            as={Link}
            to="/signup"
            color="#38b2ac"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline', color: '#2c928d' }}
          >
            회원가입
          </ChakraLink>
        </Flex>

      </Flex>

      <Stack spacing={6} maxW="1200px" mx="auto" zIndex={1}>
        {artistsData.map((artistData: any, index: any) => (
          <Box key={index}>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              color={textColor}
              mb={4}
              textTransform="uppercase"
            >
              {artistData.artist}
            </Text>
            <Flex wrap="wrap" gap={4} mb={6}>
              {artistData.albums
                .filter((album) => album.images && album.images.length > 0)
                .map((album) => (
                  <Box key={album.id} w={{ base: '100%', sm: '48%', md: '30%' }}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Box
                        bg={cardBgColor}
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="sm"
                      >
                        <Image
                          src={album.images[0].url}
                          alt={album.name}
                          w="100%"
                          h="auto"
                          aspectRatio="1/1"
                          objectFit="cover"
                        />
                        <Box p={3}>
                          <Text fontSize="sm" fontWeight="bold" color={textColor} noOfLines={1}>
                            {album.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {album.release_date ? album.release_date.split('-')[0] : 'N/A'}
                          </Text>
                        </Box>
                      </Box>
                    </motion.div>
                  </Box>
                ))}
            </Flex>

            {artistData.topTracks && artistData.topTracks.length > 0 && (
              <Box>
                <Flex justifyContent="space-between" alignItems="center" mb={3}>
                  <Text fontSize="md" fontWeight="bold" color={textColor}>
                    인기 트랙
                  </Text>
                  <Select
                    size="sm"
                    w="150px"
                    bg={cardBgColor}
                    color={textColor}
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="default">기본 정렬</option>
                    <option value="name">이름순</option>
                    <option value="popularity">인기순</option>
                    <option value="duration">길이순</option>
                  </Select>
                </Flex>
                <Flex wrap="wrap" gap={4}>
                  {sortedTracks(artistData.topTracks).slice(0, 5).map((track) => (
                    <Box
                      key={track.id}
                      w={{ base: '100%', sm: '48%', md: '30%' }}
                      bg={cardBgColor}
                      borderRadius="lg"
                      p={3}
                      boxShadow="sm"
                      _hover={{ boxShadow: 'md' }}
                    >
                      <HStack spacing={3} alignItems="center">
                        <Image
                          src={
                            track.album && track.album.images && track.album.images.length > 2
                              ? track.album.images[2].url
                              : fallbackImage
                          }
                          alt={track.name}
                          boxSize="50px"
                          borderRadius="md"
                          objectFit="cover"
                        />
                        <Box flex="1">
                          <Text fontSize="sm" color={textColor} noOfLines={1}>
                            {track.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Popularity: {track.popularity || 'N/A'} | Duration: {formatDuration(track.duration_ms || 0)}
                          </Text>
                        </Box>
                        <IconButton
                          icon={<Play />}
                          aria-label="Play track"
                          onClick={() => handlePlay(track)}
                          variant="ghost"
                          size="sm"
                          colorScheme="teal"
                        />
                      </HStack>
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      {currentTrack && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={cardBgColor}
          p={3}
          boxShadow="md"
          maxW="1200px"
          mx="auto"
          zIndex={2}
        >
          <Flex direction="column" gap={2}>
            <HStack alignItems="center" justifyContent="space-between">
              <HStack spacing={3} alignItems="center" flex="1">
                <Image
                  src={
                    currentTrack?.album?.images?.length > 2
                      ? currentTrack.album.images[2].url
                      : (currentTrack?.album?.images?.length > 0
                        ? currentTrack.album.images[0].url
                        : fallbackImage)
                  }
                  alt={currentTrack?.name || '트랙 없음'}
                  boxSize="50px"
                  borderRadius="md"
                  objectFit="cover"
                />
                <Box>
                  <Text fontSize="sm" color={textColor} fontWeight="bold" noOfLines={1}>
                    {currentTrack?.name || '재생 중인 트랙 없음'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {currentTrack?.artists?.[0]?.name || '아티스트 없음'}
                  </Text>
                </Box>
              </HStack>
              <HStack spacing={2}>
                <IconButton
                  icon={isPlaying ? <Pause /> : <Play />}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onClick={isPlaying ? handlePause : () => handlePlay(currentTrack)}
                  variant="ghost"
                  colorScheme="teal"
                  size="sm"
                  isDisabled={!currentTrack.preview_url}
                />
                <IconButton
                  icon={<List />}
                  aria-label="Open playlist"
                  onClick={onOpen}
                  variant="ghost"
                  colorScheme="teal"
                  size="sm"
                />
              </HStack>
            </HStack>
            <Progress value={progress} size="xs" colorScheme="teal" />
          </Flex>
        </Box>
      )}

      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={cardBgColor}>
          <DrawerCloseButton color={textColor} />
          <DrawerHeader borderBottomWidth="1px" color={textColor}>
            재생 목록
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={2}>
              <Button
                leftIcon={<X />}
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={handleClearPlaylist}
                mb={4}
              >
                재생 목록 초기화
              </Button>
              {sortedTracks(playedTracks).map((track) => (
                <HStack
                  key={track.id}
                  p={2}
                  bg={cardBgColor}
                  borderRadius="md"
                  justifyContent="space-between"
                >
                  <HStack spacing={3} flex="1">
                    <Image
                      src={
                        track.album && track.album.images && track.album.images.length > 2
                          ? track.album.images[2].url
                          : (track.album && track.album.images && track.album.images.length > 0
                            ? track.album.images[0].url
                            : fallbackImage)
                      }
                      alt={track.name}
                      boxSize="40px"
                      borderRadius="md"
                      objectFit="cover"
                    />
                    <Box>
                      <Text fontSize="sm" color={textColor} noOfLines={1}>
                        {track.name} - {track.artists[0]?.name || 'Unknown Artist'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Duration: {formatDuration(track.duration_ms || 0)}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <IconButton
                      icon={<Trash />}
                      aria-label="Delete from playlist"
                      onClick={() => handleDelete(track.id)}
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                    />
                  </HStack>
                </HStack>
              ))}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Music;