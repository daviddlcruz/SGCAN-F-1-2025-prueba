import { useEffect, useState } from "react";
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Chip,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    AppBar,
    Toolbar,
    Input
  } from "@mui/material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [jobLinks, setJobLinks] = useState([]);
    const [dialogLoading, setDialogLoading] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get("/files");
            console.log(response)
            setJobs(response.data);
        } catch (err) {
            setError("Error: " + err.response?.data?.detail);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Debe seleccionar un archivo");
            return;
        }

        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("uploaded_file", file);

        try {
            await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setFile(null);
            fetchJobs();
        } catch (err) {
            setError("Error de carga: " + err.response?.data?.detail || "Error inesperado.");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleOpenDialog = async (jobId: number) => {
        setOpen(true);
        setSelectedJobId(jobId);
        setDialogLoading(true);

        try {
            const response = await api.get(`/files/${jobId}/links`);
            setJobLinks(response.data);
        } catch (err) {
            setError("Error loading links");
        } finally {
            setDialogLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setSelectedJobId(null);
        setJobLinks([]);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <AppBar position="static">
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6">Dashboard</Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
                <Input type="file" onChange={handleFileChange} accept=".txt" />
                <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading || !file} sx={{ ml: 2 }}>
                    {uploading ? "Uploading..." : "Cargar archivos"}
                </Button>
            </Paper>

            {loading && <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />}
            {error && <Typography color="secondary" align="center">{error}</Typography>}

            {!loading && !error && (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell><b>ID</b></TableCell>
                        <TableCell><b>Archivo</b></TableCell>
                        <TableCell><b># Links</b></TableCell>
                        <TableCell><b>Fecha Carga</b></TableCell>
                        <TableCell><b>Estado</b></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                        <TableRow key={job.job_id}>
                            <TableCell>
                                {job.job_id}
                            </TableCell>
                            <TableCell>
                                {job.file_path}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleOpenDialog(job.job_id)}
                                >
                                    {job.link_count}
                                </Button>
                            </TableCell>
                            <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                                <Chip
                                    label={job.status}
                                    color={
                                        job.status === "COMPLETED" ? "success" :
                                        job.status === "PROCESSING" ? "warning" : "error"
                                    }
                                />
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={3} align="center">No links found</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Links del Archivo {selectedJobId}</DialogTitle>
                <DialogContent dividers>
                    {dialogLoading ? (
                        <CircularProgress sx={{ display: "block", mx: "auto", mt: 3 }} />
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Link</b></TableCell>
                                        <TableCell><b>Processed</b></TableCell>
                                        <TableCell><b>Processed At</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobLinks.length > 0 ? (
                                        jobLinks.map((link, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <a href={link.link} target="_blank" rel="noopener noreferrer">
                                                        {link.link}
                                                    </a>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={link.processed ? "Yes" : "No"}
                                                        color={link.processed ? "success" : "warning"}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {link.processed_at ? new Date(link.processed_at).toLocaleString() : "N/A"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No links found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary" variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DashboardPage;