import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Text, Select, Stack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [filterRole, setFilterRole] = useState("Semua");
  const [filterEntitas, setFilterEntitas] = useState("Semua");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLogs(data);
  };

  const filteredLogs = logs.filter(l => {
    const matchRole = filterRole === "Semua" || l.role === filterRole;
    const matchEntitas = filterEntitas === "Semua" || l.entitas === filterEntitas;
    return matchRole && matchEntitas;
  });

  const entitasList = Array.from(new Set(logs.map(l => l.entitas)));

  return (<Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
    <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
      Audit Log
    </Heading>

    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={3}
      mb={4}
      align={{ base: 'stretch', md: 'center' }}
    >
      <Select
        placeholder="Filter Role"
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        maxW={{ base: '100%', md: '200px' }}
        size="sm"
      >
        <option value="Semua">Semua</option>
        <option value="admin">Admin</option>
        <option value="guru">Guru</option>
      </Select>

      <Select
        placeholder="Filter Entitas"
        value={filterEntitas}
        onChange={(e) => setFilterEntitas(e.target.value)}
        maxW={{ base: '100%', md: '200px' }}
        size="sm"
      >
        <option value="Semua">Semua</option>
        {entitasList.map((ent) => (
          <option key={ent} value={ent}>
            {ent}
          </option>
        ))}
      </Select>
    </Stack>

    <Box overflowX="auto" borderRadius="md">
      <Table size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th>Waktu</Th>
            <Th>Nama</Th>
            <Th>Role</Th>
            <Th>Aksi</Th>
            <Th>Entitas</Th>
            <Th>Detail</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredLogs.map((log) => (
            <Tr key={log.id}>
              <Td whiteSpace="nowrap">
                {format(log.timestamp.toDate(), 'dd/MM/yyyy HH:mm')}
              </Td>
              <Td>{log.nama}</Td>
              <Td>
                <Text textTransform="capitalize">{log.role}</Text>
              </Td>
              <Td>{log.aksi}</Td>
              <Td>{log.entitas}</Td>
              <Td>{log.detail}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Box>
  );
}
