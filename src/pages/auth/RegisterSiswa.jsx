import { useState } from "react";
import {
  Box, Input, Button, Heading, VStack, useToast, Select, useBreakpointValue, Flex, IconButton, FormControl, InputGroup, InputRightElement
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getDocs, collection } from "firebase/firestore";
import { useEffect } from "react";

export default function RegisterSiswa() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [subkelasList, setSubkelasList] = useState([]);

  useEffect(() => {
    const fetchSubkelas = async () => {
      const snapshot = await getDocs(collection(db, "subkelas"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      data.sort((a, b) => {
        const [numA, letterA] = a.nama.match(/(\d+)([A-Z])/).slice(1);
        const [numB, letterB] = b.nama.match(/(\d+)([A-Z])/).slice(1);
        return numA === numB ? letterA.localeCompare(letterB) : Number(numA) - Number(numB);
      });
  
      setSubkelasList(data);
    };
  
    fetchSubkelas();
  }, []);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", result.user.uid), {
        email,
        nama,
        kelas,
        role: "siswa"
      });

      toast({ title: "Registrasi berhasil", description: "Silakan login.", status: "success" });
      navigate("/");
    } catch (err) {
      toast({ title: "Registrasi gagal", description: err.message, status: "error" });
    }
  };
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.50"
      p={6}
    >
      <Box p={6} w="md" mx="auto" bg="white" boxShadow="lg" borderRadius="md">
        <Heading mb={6} fontSize={isMobile ? "2xl" : "3xl"} textAlign="center" color="teal.500">
          Register Siswa
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          />
          <FormControl>
            <InputGroup>
              <InputRightElement>
                <IconButton
                  mt={2}
                  variant="text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onClick={togglePasswordVisibility}
                />
              </InputRightElement>

              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                focusBorderColor="teal.500"
                _hover={{ borderColor: 'teal.300' }}
              />
            </InputGroup>
          </FormControl>
          <Select
            placeholder="Pilih Kelas"
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            size="lg"
            focusBorderColor="teal.500"
            _hover={{ borderColor: 'teal.300' }}
          >
            {subkelasList.map(sub => (
              <option key={sub.id} value={sub.nama}>{sub.nama}</option>
            ))}
          </Select>

          <Button
            colorScheme="teal"
            size="md"
            width="100%"
            onClick={handleRegister}
            _hover={{ bg: 'teal.600' }}
            _active={{ bg: 'teal.700' }}
          >
            Daftar
          </Button>
          <Button
            colorScheme="gray"
            size="md"
            width="100%"
            onClick={() => { navigate("/") }}
            _hover={{ bg: 'gray.400' }}
            _active={{ bg: 'gray.700' }}
          >
            Kembali
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
