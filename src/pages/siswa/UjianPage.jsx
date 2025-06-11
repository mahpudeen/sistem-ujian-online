/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box, Heading, Text, RadioGroup, Stack, Radio,
  Button, useToast, Progress
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc, getDoc, collection, getDocs, setDoc, serverTimestamp, updateDoc
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function UjianPage() {
  const { id } = useParams(); // ujianAktifId
  const { user } = useAuth();
  const [soal, setSoal] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [waktuSisa, setWaktuSisa] = useState(null);
  const [selesai, setSelesai] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const [opsiMap, setOpsiMap] = useState({});
  const [soalOrder, setSoalOrder] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  // Shuffle helper
  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const ujianRef = doc(db, "ujianAktif", id);
    const ujianSnap = await getDoc(ujianRef);
    if (!ujianSnap.exists()) {
      toast({ title: "Ujian tidak ditemukan", status: "error" });
      return;
    }

    const ujian = ujianSnap.data();
    setSoal(ujian);

    // Ambil pertanyaan
    const pertanyaanSnap = await getDocs(collection(db, "soal", ujian.soalId, "pertanyaan"));
    const allPertanyaan = pertanyaanSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Acak urutan soal
    const soalOrder = shuffleArray(allPertanyaan.map(p => p.id));

    // Buat pertanyaan acak dengan opsi teracak juga
    const opsiMapTemp = {};
    const finalPertanyaan = soalOrder.map(id => {
      const p = allPertanyaan.find(item => item.id === id);
      const opsiAsli = [...p.opsi];
      const opsiAcak = shuffleArray(opsiAsli);
      const mapping = opsiAcak.map(item => opsiAsli.indexOf(item));
      opsiMapTemp[p.id] = mapping;

      return {
        ...p,
        opsi: opsiAcak
      };
    });

    setPertanyaanList(finalPertanyaan);
    setOpsiMap(opsiMapTemp);
    setSoalOrder(soalOrder);

    // Set waktu selesai
    const selesaiAt = ujian.selesai.toDate();
    setWaktuSisa(Math.floor((selesaiAt - new Date()) / 1000));

    // Simpan status monitoring siswa
    await setDoc(doc(db, "logUjianAktif", id, "monitoring", user.uid), {
      nama: user.nama,
      kelas: user.kelas,
      sedangUjian: true,
      tabSwitchCount: 0,
      waktuMulai: serverTimestamp(),
      waktuTerakhirAktif: serverTimestamp()
    });

    launchFullscreen();
  };

  const launchFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  // Timer countdown
  useEffect(() => {
    if (!waktuSisa || selesai) return;
    const timer = setInterval(() => {
      setWaktuSisa(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [waktuSisa, selesai]);

  // Deteksi pindah tab
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden && !selesai) {
        const next = tabSwitchCount + 1;
        setTabSwitchCount(next);

        await updateDoc(doc(db, "logUjianAktif", id, "monitoring", user.uid), {
          tabSwitchCount: next,
          warning: `Tab switch ke-${next}`,
          waktuTerakhirAktif: serverTimestamp()
        });

        if (next >= 3) {
          toast({ title: "Ujian dihentikan (3x pindah tab)", status: "error" });
          handleSubmit();
        } else if (!warningShown) {
          toast({
            title: "Peringatan!",
            description: `Jangan pindah tab. (${next}/3)`,
            status: "warning",
          });
          setWarningShown(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [tabSwitchCount, warningShown, selesai]);

  // Blok Escape & shortcut
  useEffect(() => {
    const blockKey = (e) => {
      const combo = e.ctrlKey && ["c", "u", "s", "p"].includes(e.key.toLowerCase());
      if (e.key === "Escape" || combo || e.key === "F12") {
        e.preventDefault();
        toast({ title: "Shortcut diblokir selama ujian", status: "warning" });
      }
    };
    window.addEventListener("keydown", blockKey);
    return () => window.removeEventListener("keydown", blockKey);
  }, []);

  const autoSaveJawaban = async (newJawaban) => {
    if (!user || selesai) return;
    await setDoc(doc(db, "jawaban", `${user.uid}_${id}`), {
      userId: user.uid,
      soalId: soal.soalId,
      ujianId: id,
      jawaban: newJawaban,
      opsiMap,
      soalOrder,
      waktuUpdate: serverTimestamp()
    });
  };

  const handleChange = (pertanyaanId, opsiIndex) => {
    const newJawaban = { ...jawaban, [pertanyaanId]: opsiIndex };
    setJawaban(newJawaban);
    autoSaveJawaban(newJawaban);
  };

  const handleSubmit = async () => {
    const total = pertanyaanList.length;
    const terisi = Object.keys(jawaban).length;

    if (!selesai && terisi < total) {
      const confirm = window.confirm(
        `Masih ada ${total - terisi} soal belum dijawab. Kirim sekarang?`
      );
      if (!confirm) return;
    }

    setSelesai(true);

    await setDoc(doc(db, "jawaban", `${user.uid}_${id}`), {
      userId: user.uid,
      soalId: soal.soalId,
      ujianId: id,
      jawaban,
      opsiMap,
      soalOrder,
      waktuSubmit: serverTimestamp()
    });

    await updateDoc(doc(db, "logUjianAktif", id, "monitoring", user.uid), {
      sedangUjian: false
    });

    toast({ title: "Jawaban dikirim", status: "success" });
    navigate("/siswa");
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={2}>Ujian: {soal?.soalKode}</Heading>
      <Text mb={4}>Sisa waktu: <strong>{formatTimer(waktuSisa || 0)}</strong></Text>
      <Progress value={(Object.keys(jawaban).length / pertanyaanList.length) * 100} mb={4} />

      <Stack spacing={6}>
        {pertanyaanList.map((p, idx) => (
          <Box key={p.id} p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold" mb={2}>
              {idx + 1}. {p.teks}
            </Text>
            <RadioGroup
              onChange={(val) => handleChange(p.id, parseInt(val))}
              value={jawaban[p.id]?.toString()}
            >
              <Stack>
                {p.opsi.map((opsi, i) => (
                  <Radio key={i} value={i.toString()}>
                    {opsi}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
        ))}
      </Stack>

      <Button
        mt={6}
        colorScheme="teal"
        onClick={handleSubmit}
        isDisabled={selesai}
      >
        Submit Ujian
      </Button>
    </Box>
  );
}
