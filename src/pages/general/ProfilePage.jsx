import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    newEmail: "",
    newPassword: "",
    currentPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData((prev) => ({
            ...prev,
            nama: data.nama || "",
            email: data.email || "",
          }));
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        nama: formData.nama,
      });
      toast({ title: "Profil berhasil diperbarui", status: "success" });
    } catch (err) {
      toast({ title: "Gagal memperbarui", description: err.message, status: "error" });
    }
    setSaving(false);
  };

  const handleChangeEmail = async () => {
    try {
      const credential = EmailAuthProvider.credential(formData.email, formData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, formData.newEmail);
      await updateDoc(doc(db, "users", user.uid), { email: formData.newEmail });
      toast({ title: "Email berhasil diganti", status: "success" });
    } catch (err) {
      toast({ title: "Gagal ganti email", description: err.message, status: "error" });
    }
  };

  const handleChangePassword = async () => {
    try {
      const credential = EmailAuthProvider.credential(formData.email, formData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, formData.newPassword);
      toast({ title: "Password berhasil diganti", status: "success" });
    } catch (err) {
      toast({ title: "Gagal ganti password", description: err.message, status: "error" });
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Box maxW="lg" mx="auto" p={6} mt={10} bg="white" shadow="md" borderRadius="lg">
      <VStack spacing={5} align="stretch">
        <Heading size="md">Manajemen Profil</Heading>

        <form onSubmit={handleSave}>
          <FormControl mb={4}>
            <FormLabel>Nama Lengkap</FormLabel>
            <Input name="nama" value={formData.nama} onChange={handleChange} />
          </FormControl>

          <FormControl mb={4} isDisabled>
            <FormLabel>Email Sekarang</FormLabel>
            <Input name="email" value={formData.email} isReadOnly />
          </FormControl>

          <Button type="submit" colorScheme="teal" isLoading={saving}>
            Simpan Perubahan
          </Button>
        </form>

        <Box borderTop="1px solid #eee" pt={4}>
          <Heading size="sm">Ganti Email</Heading>
          <FormControl mt={2}>
            <FormLabel>Email Baru</FormLabel>
            <Input name="newEmail" value={formData.newEmail} onChange={handleChange} />
          </FormControl>
          <FormControl mt={2}>
            <FormLabel>Password Saat Ini</FormLabel>
            <Input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </FormControl>
          <Button mt={2} onClick={handleChangeEmail} colorScheme="blue">
            Ganti Email
          </Button>
        </Box>

        <Box borderTop="1px solid #eee" pt={4}>
          <Heading size="sm">Ganti Password</Heading>
          <FormControl mt={2}>
            <FormLabel>Password Baru</FormLabel>
            <Input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mt={2}>
            <FormLabel>Password Saat Ini</FormLabel>
            <Input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </FormControl>
          <Button mt={2} onClick={handleChangePassword} colorScheme="orange">
            Ganti Password
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
