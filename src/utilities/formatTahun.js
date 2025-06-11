function formatTahun (kode) {
  const awal = parseInt("20" + kode.slice(0, 2));
  const akhir = parseInt("20" + kode.slice(2));
  return `${awal}/${akhir}`;
};
export default formatTahun