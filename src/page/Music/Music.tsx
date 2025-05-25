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
} from '@chakra-ui/react';
import { Pause, Play, Trash, Search, List } from 'lucide-react';
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = '#121212';
  const cardBgColor = useColorModeValue('gray.800', 'gray.700');
  const textColor = 'white';
  const accentColor = 'teal.400';

  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID_API_KEY;
  const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_SECRET_ID_API_KEY;
  const ARTISTS = ['10cm', 'IU'];

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

  useEffect(() => {
    const fetchArtistsData = async () => {
      if (!accessToken) return;
      const allArtistsData = [];
      for (const artistName of ARTISTS) {
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
          const topTracks = topTracksResponse.data.tracks;

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
    fetchArtistsData();
  }, [accessToken]);

  useEffect(() => {
    const savedTracks = localStorage.getItem('playedTracks');
    if (savedTracks) setPlayedTracks(JSON.parse(savedTracks));
  }, []);

  const handlePlay = (track) => {
    console.log('재생 시도:', track.name);
    // 트랙을 재생 목록에 추가 (preview_url 유무와 관계없이)
    if (!playedTracks.find((t) => t.id === track.id)) {
      const updatedPlayedTracks = [...playedTracks, track];
      setPlayedTracks(updatedPlayedTracks);
      localStorage.setItem('playedTracks', JSON.stringify(updatedPlayedTracks));
      console.log('재생 목록에 추가:', track.name);
    }

    if (!track.preview_url) {
      console.warn('이 트랙은 미리듣기를 지원하지 않습니다:', track.name);
      const fallbackTrack = artistsData
        .flatMap((artist) => artist.topTracks)
        .find((t) => t.preview_url);
      if (fallbackTrack) {
        console.log('대체 트랙으로 전환:', fallbackTrack.name);
        setCurrentTrack(fallbackTrack);
        playTrack(fallbackTrack);
        return;
      } else {
        setCurrentTrack({
          name: '미리듣기 불가',
          artists: [{ name: '알 수 없음' }],
          album: { images: [{}, {}, { url: 'https://via.placeholder.com/50' }] },
        });
        return;
      }
    }
    setCurrentTrack(track);
    playTrack(track);
  };

  const playTrack = (track) => {
    if (audio) audio.pause();
    const newAudio = new Audio(track.preview_url);
    newAudio.play()
      .then(() => console.log('재생 시작:', track.name))
      .catch((error) => {
        console.error('재생 실패:', error.message);
        if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
          console.warn('브라우저 보안 정책 또는 지원되지 않는 형식입니다.');
        }
      });
    newAudio.loop = false;
    newAudio.volume = 0.5;
    setAudio(newAudio);
    setIsPlaying(true);

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

  return (
    <Box bg={bgColor} minHeight="100vh" p={4} position="relative" overflow="hidden">
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
                      onClick={() => {
                        if (album.tracks && album.tracks.length > 0) {
                          handlePlay(album.tracks[0]);
                        }
                      }}
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
                </Box>
              ))}
            </Flex>

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
            src={
              currentTrack?.album?.images?.[2]?.url ||
              (currentTrack?.album?.images?.length > 0
                ? currentTrack.album.images[0].url
                : 'https://via.placeholder.com/50')
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
            onClick={isPlaying ? handlePause : () => currentTrack && handlePlay(currentTrack)}
            variant="ghost"
            colorScheme="teal"
            size="sm"
            isDisabled={!currentTrack || currentTrack.name === '미리듣기 불가'}
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
      </Box>

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