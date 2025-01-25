import { useState } from 'react';
import './App.css';
import axios from 'axios';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Card,
    CardContent,
} from '@mui/material';

function App() {
    const [emailContent, setEmailContent] = useState('');
    const [tone, setTone] = useState('');
    const [generatedReply, setGeneratedReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8080/api/email/generate', {
                emailContent,
                tone,
            });
            setGeneratedReply(
                typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
            );
        } catch (error) {
            setError('Failed to generate email reply. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                    <Typography
                        variant="h4"
                        component="h1"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                        Email Reply Generator
                    </Typography>

                    <Box sx={{ mx: 2, mt: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            label="Original Email Content"
                            value={emailContent || ''}
                            onChange={(e) => setEmailContent(e.target.value)}
                            sx={{ mb: 3, borderRadius: 1 }}
                        />

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Tone (Optional)</InputLabel>
                            <Select
                                value={tone || ''}
                                label="Tone (Optional)"
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="professional">Professional</MenuItem>
                                <MenuItem value="casual">Casual</MenuItem>
                                <MenuItem value="friendly">Friendly</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={!emailContent || loading}
                            fullWidth
                            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Generate Reply'}
                        </Button>
                    </Box>

                    {error && (
                        <Typography color="error" align="center" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}

                    {generatedReply && (
                        <Box sx={{ mt: 4, px: 2 }}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ fontWeight: 'bold', color: 'text.secondary' }}
                            >
                                Generated Reply:
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                variant="outlined"
                                value={generatedReply || ''}
                                inputProps={{ readOnly: true }}
                                sx={{ mb: 3, borderRadius: 1 }}
                            />

                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigator.clipboard.writeText(generatedReply)}
                                sx={{ py: 1, fontWeight: 'bold' }}
                            >
                                Copy to Clipboard
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

export default App;
