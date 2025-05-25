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
  Collapse,
  Input,
} from '@chakra-ui/react';
import { Pause, Play, Trash, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Music = () => {
  const [artistsData, setArtistsData] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [playedTracks, setPlayedTracks] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [expandedAlbum, setExpandedAlbum] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 테마 색상 (유튜브 뮤직 스타일)
  const bgColor = '#121212';
  const cardBgColor = useColorModeValue('gray.800', 'gray.700');
  const textColor = 'white';
  const accentColor = 'teal.400';

  // Spotify API 인증 정보
  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID_API_KEY;
  const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_SECRET_ID_API_KEY;
  const ARTISTS = ['10cm', 'IU'];

  // Spotify 액세스 토큰 발급
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

  // Spotify 데이터 가져오기
  useEffect(() => {
    const fetchArtistsData = async () => {
      if (!accessToken) return;
      const allArtistsData = [];
      for (const artistName of ARTISTS) {
        try {
          // 아티스트 검색
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

          // 아티스트의 앨범 가져오기
          const albumsResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artist.id}/albums`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { limit: 10, include_groups: 'album,single' },
            }
          );
          const albums = albumsResponse.data.items;

          // 아티스트의 인기 트랙 가져오기
          const topTracksResponse = await axios.get(
            `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { market: 'KR' },
            }
          );
          const topTracks = topTracksResponse.data.tracks;

          // 앨범별 트랙 가져오기
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
    };
    fetchArtistsData();
  }, [accessToken]);

  // 로컬 스토리지에서 재생 목록 로드
  useEffect(() => {
    const savedTracks = localStorage.getItem('playedTracks');
    if (savedTracks) setPlayedTracks(JSON.parse(savedTracks));
  }, []);

  // 오디오 재생/일시정지
  const handlePlay = (track) => {
    if (!track.preview_url) {
      console.warn('이 트랙은 미리듣기를 지원하지 않습니다:', track.name);
      return;
    }
    if (audio) audio.pause();
    const newAudio = new Audio(track.preview_url);
    newAudio.play().catch((error) => console.error('재생 오류:', error.message));
    newAudio.loop = false;
    newAudio.volume = 0.5;
    setAudio(newAudio);
    setCurrentTrack(track);
    setIsPlaying(true);

    if (!playedTracks.find((t) => t.id === track.id)) {
      const updatedPlayedTracks = [...playedTracks, track];
      setPlayedTracks(updatedPlayedTracks);
      localStorage.setItem('playedTracks', JSON.stringify(updatedPlayedTracks));
    }

    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
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
  };

  const toggleAlbum = (albumId) => {
    setExpandedAlbum(expandedAlbum === albumId ? null : albumId);
  };

  return (
    <Box bg={bgColor} minHeight="100vh" p={4} position="relative" overflow="hidden">
      {/* 상단 네비게이션 바 */}
      <Flex
        position="sticky"
        top={0}
        zIndex={3}
        bg={bgColor}
        p={4}
        alignItems="center"
        justifyContent="space-between"
        boxShadow="sm"
      >
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          Music App
        </Text>
        <Flex alignItems="center">
          <Input
            placeholder="검색"
            size="sm"
            w="200px"
            mr={2}
            borderRadius="full"
            bg={cardBgColor}
            color={textColor}
            _placeholder={{ color: 'gray.500' }}
          />
          <IconButton
            icon={<Search />}
            aria-label="Search"
            variant="ghost"
            colorScheme="teal"
            size="sm"
          />
        </Flex>
      </Flex>

      {/* 앨범 카드 (그리드 형태) */}
      <Stack spacing={6} maxW="1200px" mx="auto" zIndex={1}>
        {artistsData.map((artistData, index) => (
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
            {/* 앨범 그리드 */}
            <Flex wrap="wrap" gap={4} mb={6}>
              {artistData.albums.map((album) => (
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
                      cursor="pointer"
                      onClick={() => toggleAlbum(album.id)}
                      _hover={{ boxShadow: 'md' }}
                    >
                      <Image
                        src={album.images[0]?.url || 'https://via.placeholder.com/300'}
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
                          {album.release_date.split('-')[0]}
                        </Text>
                      </Box>
                    </Box>
                  </motion.div>
                  {/* 트랙 확장 */}
                  <Collapse in={expandedAlbum === album.id} animateOpacity>
                    <Stack spacing={2} mt={2} p={2} bg={cardBgColor} borderRadius="lg">
                      {album.tracks.map((track) => (
                        <HStack
                          key={track.id}
                          p={2}
                          bg={cardBgColor}
                          borderRadius="md"
                          justifyContent="space-between"
                        >
                          <Text fontSize="sm" color={textColor} noOfLines={1}>
                            {track.name}
                          </Text>
                          <IconButton
                            icon={<Play />}
                            aria-label="Play track"
                            onClick={() => handlePlay(track)}
                            variant="ghost"
                            size="sm"
                            colorScheme="teal"
                          />
                        </HStack>
                      ))}
                    </Stack>
                  </Collapse>
                </Box>
              ))}
            </Flex>

            {/* 인기 트랙 섹션 */}
            {artistData.topTracks && artistData.topTracks.length > 0 && (
              <Box>
                <Text fontSize="md" fontWeight="bold" color={textColor} mb={3}>
                  인기 트랙
                </Text>
                <Flex wrap="wrap" gap={4}>
                  {artistData.topTracks.slice(0, 5).map((track) => (
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
                          src={track.album.images[2]?.url || 'https://via.placeholder.com/50'}
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
                            Popularity: {track.popularity}
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

      {/* 하단 재생 UI */}
      {currentTrack && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={cardBgColor}
          p={3}
          boxShadow="md"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          maxW="1200px"
          mx="auto"
          zIndex={2}
        >
          <HStack spacing={3} alignItems="center" flex="1">
            <Image
              src={currentTrack.album?.images[2]?.url || 'https://via.placeholder.com/50'}
              alt={currentTrack.name}
              boxSize="50px"
              borderRadius="md"
            />
            <Box>
              <Text fontSize="sm" color={textColor} fontWeight="bold" noOfLines={1}>
                {currentTrack.name}
              </Text>
              <Text fontSize="xs" color="gray.500">{currentTrack.artists[0].name}</Text>
            </Box>
          </HStack>
          <IconButton
            icon={isPlaying ? <Pause /> : <Play />}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={isPlaying ? handlePause : () => handlePlay(currentTrack)}
            variant="ghost"
            colorScheme="teal"
            size="sm"
          />
          <Button size="sm" onClick={onOpen} colorScheme="teal" variant="outline">
            재생 목록
          </Button>
        </Box>
      )}

      {/* 재생 목록 드로워 */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={cardBgColor}>
          <DrawerCloseButton color={textColor} />
          <DrawerHeader borderBottomWidth="1px" color={textColor}>
            재생 목록
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={2}>
              {playedTracks.map((track) => (
                <HStack
                  key={track.id}
                  p={2}
                  bg={cardBgColor}
                  borderRadius="md"
                  justifyContent="space-between"
                >
                  <Text fontSize="sm" color={textColor} noOfLines={1}>
                    {track.name} - {track.artists[0].name}
                  </Text>
                  <HStack>
                    <IconButton
                      icon={<Play />}
                      aria-label="Play from playlist"
                      onClick={() => {
                        handlePlay(track);
                        onClose();
                      }}
                      variant="ghost"
                      size="sm"
                      colorScheme="teal"
                    />
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