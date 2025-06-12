import {
  Box, Heading, Text, Stack, Spinner, Badge, Divider
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function DashboardGuru() {
  const { user } = useAuth();
  const [mapelList, setMapelList] = useState([]);
  const [subkelasList, setSubkelasList] = useState([]);
  const [ujianList, setUjianList] = useState({ aktif: [], mendatang: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    const [mapelSnap, subkelasSnap, ujianSnap] = await Promise.all([
      getDocs(collection(db, "mapel")),
      getDocs(collection(db, "subkelas")),
      getDocs(collection(db, "ujianAktif"))
    ]);

    const allMapel = mapelSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allSubkelas = subkelasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allUjian = ujianSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const mapelGuru = allMapel.filter(m => user.mapel?.includes(m.id));
    const subkelasGuru = allSubkelas.filter(s => user.subkelas?.includes(s.id));
    const namamapelGuru = mapelGuru.map(s => s.nama);
    const namasubkelasGuru = subkelasGuru.map(s => s.nama);

    const now = Timestamp.now().toMillis();

    const ujianAktif = allUjian.filter(u =>
      namamapelGuru?.includes(u.mapel) &&
      namasubkelasGuru.some(item => u.kelas.includes(item)) &&
      u.mulai.toMillis() <= now &&
      u.selesai.toMillis() > now
    );

    const ujianMendatang = allUjian.filter(u =>
      namamapelGuru?.includes(u.mapel) &&
      namasubkelasGuru.some(item => u.kelas.includes(item)) &&
      u.mulai.toMillis() > now
    );

    setMapelList(mapelGuru);
    setSubkelasList(subkelasGuru);
    setUjianList({ aktif: ujianAktif, mendatang: ujianMendatang });
    setLoading(false);
  };

  if (loading) return <Spinner mt={10} size="xl" color="teal.500" />;

  return (
    <Box p={4} mx="auto">
      <Heading size="lg" mb={2} color="teal.600">Halo, {user.nama}</Heading>

      <Box mt={4} p={4} bg="gray.50" borderRadius="md" boxShadow="sm">
        <Text fontWeight="bold" mb={2}>📘 Mapel yang Diampu:</Text>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {mapelList.map(m => (
            <Badge key={m.id} colorScheme="teal">{m.nama}</Badge>
          ))}
        </Stack>
      </Box>

      <Box mt={4} p={4} bg="gray.50" borderRadius="md" boxShadow="sm">
        <Text fontWeight="bold" mb={2}>🏫 Kelas yang Diampu:</Text>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {subkelasList.map(s => (
            <Badge key={s.id} colorScheme="blue">{s.nama}</Badge>
          ))}
        </Stack>
      </Box>

      <Box mt={6}>
        <Text fontWeight="bold" fontSize="lg" mb={3} color="teal.700">📅 Ujian Aktif:</Text>
        {ujianList.aktif.length === 0 ? (
          <Text textColor="gray.500">Tidak ada ujian aktif saat ini.</Text>
        ) : (
          <Stack spacing={3} mb={6}>
            {ujianList.aktif.map(u => (
              <Box key={u.id} p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="bold" mb={1}>{u.nama}</Text>
                <Text fontSize="sm">Kelas: {u.kelas.join(', ')}</Text>
                <Text fontSize="sm">Mapel: {u.mapel}</Text>
                <Text fontSize="sm">Berakhir: {u.selesai.toDate().toLocaleString()}</Text>
              </Box>
            ))}
          </Stack>
        )}

        <Divider mb={4} />

        <Text fontWeight="bold" fontSize="lg" mb={3} color="gray.700">🕒 Ujian Akan Datang:</Text>
        {ujianList.mendatang.length === 0 ? (
          <Text textColor="gray.500">Tidak ada ujian terjadwal.</Text>
        ) : (
          <Stack spacing={3}>
            {ujianList.mendatang.map(u => (
              <Box key={u.id} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text fontWeight="bold" mb={1}>{u.nama}</Text>
                <Text fontSize="sm">Kelas: {u.kelas.join(', ')}</Text>
                <Text fontSize="sm">Mapel: {u.mapel}</Text>
                <Text fontSize="sm">Mulai: {u.mulai.toDate().toLocaleString()}</Text>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
