import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Avatar
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' }
];

function CreatePost({ onPostCreated }) {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    code: '',
    language: '',
    theme: 'light'
  });
  const [preview, setPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      theme: e.target.checked ? 'dark' : 'light'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/posts', {
        ...formData,
        authorId: currentUser.id
      });
      
      setFormData({
        title: '',
        content: '',
        code: '',
        language: '',
        theme: 'light'
      });
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={currentUser?.avatar}
            sx={{ mr: 2 }}
          >
            {currentUser?.name?.charAt(0)}
          </Avatar>
          <Typography>
            Compartilhe seu conhecimento...
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Conteúdo"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            required
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Código
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Linguagem</InputLabel>
              <Select
                name="language"
                value={formData.language}
                onChange={handleChange}
                label="Linguagem"
              >
                {LANGUAGES.map(lang => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Código"
              name="code"
              value={formData.code}
              onChange={handleChange}
              multiline
              rows={5}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.theme === 'dark'}
                  onChange={handleThemeChange}
                />
              }
              label="Tema Escuro"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preview}
                  onChange={(e) => setPreview(e.target.checked)}
                />
              }
              label="Preview"
            />
          </Box>

          {preview && formData.code && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Preview:
              </Typography>
              <Card sx={{ 
                backgroundColor: formData.theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                color: formData.theme === 'dark' ? '#FFFFFF' : 'inherit'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {formData.title}
                  </Typography>
                  
                  <Typography sx={{ mb: 2 }}>
                    {formData.content}
                  </Typography>

                  <Box sx={{ 
                    backgroundColor: formData.theme === 'dark' ? '#2D2D2D' : '#F5F5F5',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      p: 1, 
                      backgroundColor: formData.theme === 'dark' ? '#1E1E1E' : '#E0E0E0'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: formData.theme === 'dark' ? '#CCCCCC' : '#666666',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                        {LANGUAGES.find(lang => lang.value === formData.language)?.label || formData.language}
                      </Typography>
                    </Box>
                    <SyntaxHighlighter
                      language={formData.language}
                      style={formData.theme === 'dark' ? vscDarkPlus : vs}
                      customStyle={{
                        margin: 0,
                        padding: '16px',
                        backgroundColor: 'transparent'
                      }}
                    >
                      {formData.code}
                    </SyntaxHighlighter>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
          >
            Publicar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CreatePost; 