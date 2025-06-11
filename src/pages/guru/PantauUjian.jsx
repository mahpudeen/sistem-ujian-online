import {
  Box, Heading, Text, Select, Table, Thead, Tbody, Tr, Th, Td,
  Tag
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { formatDistanceToNow } from "date-fns";

export default function PantauUjian() {
  const [ujianList, setUjianList] = useState([]);
  const [ujianId, setUjianId] = useState("");
  const [siswaList, setSiswaList] = useState([]);
  const [jumlahSoal, setJumlahSoal] = useState(0);
  const [progresJawaban, setProgresJawaban] = useState({});

  useEffect(() => {
    fetchUjianAktif();
  }, []);

  const fetchUjianAktif = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    const list = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.aktif);
    setUjianList(list);
  };

  // Listener monitoring realtime
  useEffect(() => {
    if (!ujianId) return;
  
    const run = async () => {
      const ujian = ujianList.find(u => u.id === ujianId);
      if (!ujian) return;
  
      // Hitung jumlah soal
      const soalSnap = await getDocs(collection(db, "soal", ujian.soalId, "pertanyaan"));
      setJumlahSoal(soalSnap.docs.length);
  
      // Setup realtime listener monitoring
      const unsub = onSnapshot(
        collection(db, "logUjianAktif", ujianId, "monitoring"),
        async (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSiswaList(data);
  
          // Fetch progres jawaban untuk tiap siswa
          for (const siswa of data) {
            const jawabSnap = await getDoc(doc(db, "jawaban", `${siswa.id}_${ujianId}`));
            if (jawabSnap.exists()) {
              const isi = jawabSnap.data().jawaban || {};
              setProgresJawaban(prev => ({
                ...prev,
                [siswa.id]: Object.keys(isi).length
              }));
            } else {
              setProgresJawaban(prev => ({
                ...prev,
                [siswa.id]: 0
              }));
            }
          }
        }
      );
  
      // Cleanup
      return unsub;
    };
  
    const cleanup = run();
    return () => {
      cleanup.then(unsub => typeof unsub === "function" && unsub());
    };
  }, [ujianId, ujianList]);
  

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Pantau Ujian</Heading>

      <Select
        placeholder="Pilih Ujian"
        value={ujianId}
        onChange={(e) => setUjianId(e.target.value)}
        mb={4}
      >
        {ujianList.map((u) => (
          <option key={u.id} value={u.id}>
            {u.soalKode} - {u.kelas.join(", ")}
          </option>
        ))}
      </Select>

      {ujianId && (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>Nama</Th>
                <Th>Kelas</Th>
                <Th>Status</Th>
                <Th>Progress</Th>
                <Th>Tab Switch</Th>
                <Th>Aktivitas Terakhir</Th>
                <Th>Warning</Th>
              </Tr>
            </Thead>
            <Tbody>
              {siswaList.map((s) => (
                <Tr key={s.id}>
                  <Td 
                    bg={
                      s.tabSwitchCount >= 3 ? "red.400" :
                      !s.sedangUjian ? "gray.400" :
                      s.tabSwitchCount >= 1 ? "orange.400" : undefined
                    }
                  >{s.nama}</Td>
                  <Td
                    bg={
                      s.tabSwitchCount >= 3 ? "red.400" :
                      !s.sedangUjian ? "gray.400" :
                      s.tabSwitchCount >= 1 ? "orange.400" : undefined
                    }
                  >{s.kelas}</Td>
                  <Td>
                    {s.sedangUjian
                      ? <Tag colorScheme="green">Aktif</Tag>
                      : <Tag colorScheme="gray">Selesai</Tag>}
                  </Td>
                  <Td>
                    {progresJawaban[s.id] != null
                      ? `${progresJawaban[s.id]}/${jumlahSoal}`
                      : "-"}
                  </Td>
                  <Td>
                    <Tag colorScheme={s.tabSwitchCount >= 3 ? "red" : s.tabSwitchCount > 0 ? "orange" : "gray"}>
                      {s.tabSwitchCount || 0}
                    </Tag>
                  </Td>
                  <Td>
                    {s.waktuTerakhirAktif?.seconds
                      ? formatDistanceToNow(new Date(s.waktuTerakhirAktif.seconds * 1000), { addSuffix: true })
                      : "-"}
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="red.500">{s.warning || "-"}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Box>
  );
}
