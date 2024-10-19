import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    List,
    ListItem,
    ListItemText,
    Collapse,
    IconButton,
    Input,
    Box,
    Tabs,
    Tab,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Formik, Form, Field } from 'formik';

import { Document, Page, pdfjs } from 'react-pdf';
import axiosInstance from '../../AxiosInstance';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const categories = [
    "Programming",
    "Design",
    "Marketing",
    "Business"
];

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [course, setCourse] = useState(null);
    const [openAddSection, setOpenAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [expandedSection, setExpandedSection] = useState(null);
    const [openAddFile, setOpenAddFile] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [file, setFile] = useState(null);
    const [openAddQuiz, setOpenAddQuiz] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [expandedQuiz, setExpandedQuiz] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await axiosInstance.get(`/courses/${id}`);
            setCourse(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAddSection = async () => {
        const newSection = { title: newSectionTitle, lessons: [] };
        try {
            const response = await axiosInstance.post(`/sections/${id}`, newSection);
            setCourse({ ...course, sections: [...course.sections, response.data] });
            window.location.reload()
            setOpenAddSection(false);
            setNewSectionTitle('');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    };

    const handleUploadFile = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);

        try {
            const response = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, formData, {
                onUploadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    const uploadProgress = Math.round((loaded * 100) / total);
                    setProgress(uploadProgress);
                }
            });
            await addFileToSection(selectedSectionId, response.data.secure_url);
            setOpenAddFile(false);
        } catch (error) {
            setOpenAddFile(false);
            alert(error.response.data.error.message)
        } finally {
            setProgress(0);
        }
    };

    const addFileToSection = async (sectionId, fileUrl) => {
        try {
            const response = await axiosInstance.post(`/lessons/${id}/${sectionId}`, { fileUrl });
            if (response.status == 201) {
                setOpenAddFile(false)
                alert("Lesson added successfully")
                fetchCourse()
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    };

    const [numPages, setNumPages] = useState(null);
    const renderLesson = (lessonUrl, sectionId) => {
        const extension = lessonUrl.fileUrl.split('.').pop().toLowerCase();

        const onDocumentLoadSuccess = ({ numPages }) => {
            setNumPages(numPages);
        };

        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ padding: '16px', maxWidth: '100%', margin: 'auto' }}
            >
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {['jpg', 'jpeg', 'png', 'gif', 'avif', 'svg'].includes(extension) ? (
                        <img
                            src={lessonUrl.fileUrl}
                            alt="Lesson"
                            style={{ width: '100px', height: 'auto', borderRadius: '4px', marginRight: '8px' }}
                        />
                    ) : ['mp4', 'mov', 'avi'].includes(extension) ? (
                        <video
                            controls
                            style={{ width: '100px', height: 'auto', borderRadius: '4px', marginRight: '8px' }}
                        >
                            <source src={lessonUrl.fileUrl} type={`video/${extension}`} />
                            Your browser does not support the video tag.
                        </video>
                    ) : extension === 'pdf' ? (
                        <Document
                            file={lessonUrl.fileUrl}
                            onLoadError={console.error}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            <Page pageNumber={1} />
                        </Document>
                    ) : (
                        <Typography>Unsupported file type</Typography>
                    )}
                </Box>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteLesson(lessonUrl._id, sectionId)}
                    style={{ marginLeft: '8px' }}
                >
                    Delete
                </Button>
            </Box>


        );
    };

    const handleUpdateCourse = async (values) => {
        try {
            const response = await axiosInstance.put(`/courses/${id}`, values);
            setCourse(response.data);
            alert("Course details updated successfully!");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    };

    const handleStatusChange = async (action) => {
        try {
            const response = await axiosInstance.put(`/courses/${id}/publish/?action=${action}`);
            if (response.status == 200) {
                alert(response.data.message);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    }

    const handleImageUpload = async (event, setFieldValue) => {
        const file = event.currentTarget.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);

            try {
                const response = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, formData, {
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total } = progressEvent;
                        const uploadProgress = Math.round((loaded * 100) / total);
                        setProgress(uploadProgress);
                    }
                });
                console.log("response.....", response)
                const imageUrl = response.data.secure_url;
                setFieldValue('preview_image', imageUrl);
            } catch (error) {
                alert(error.response.data.error.message)
            } finally {
                setProgress(0);
            }
        }
    };

    const deleteSection = async (sectionId) => {
        try {
            const response = await axiosInstance.delete(`/sections/${id}/${sectionId}`);
            if (response.status == 200) {
                alert(response.data.message)
                fetchCourse()
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    }

    const handleDeleteLesson = async (lesson, section) => {
        try {
            const response = await axiosInstance.delete(`/lessons/${section._id}/${lesson}`);
            if (response.status == 200) {
                alert("Lesson Deleted successfully")
                fetchCourse()
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddQuiz = async () => {
        try {
            const quizData = {
                title: quizTitle,
                questions: [{
                    question,
                    options,
                    correctAnswer,
                }],
            };
            const response = await axiosInstance.post(`/quiz/create/${id}`, quizData);
            if (response.status == 201) {
                alert("Quiz Added Successfully")
                fetchCourse()
                setQuizTitle('');
                setQuestion('');
                setOptions(['', '', '', '']);
                setCorrectAnswer('');
                setOpenAddQuiz(false);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    };

    const deleteQuiz = async (quizId) => {
        try {
            const response = await axiosInstance.delete(`/quiz/delete/${id}/${quizId}`);
            if (response.status == 200) {
                alert(response.data.message)
                fetchCourse()
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.clear();
                navigate('/');
            } else {
                console.error('Failed to fetch courses:', error);
            }
        }
    }

    const handleToggle = (quizId) => {
        setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
    };

    const handleBackClick = () => {
        navigate('/dashboard');
    };

    return (
        <Container>
            {course ? (
                <>
                    <Box mt={2} p={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleBackClick}
                            sx={{ marginRight: 2 }}
                        >
                            Back
                        </Button>

                        <Typography variant="h4" sx={{ flexGrow: 1, marginRight: 2 }}>
                            {course.title}
                        </Typography>

                        <Box>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleStatusChange('draft')}
                                sx={{ marginRight: 1 }}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleStatusChange('publish')}
                            >
                                Publish Course
                            </Button>
                        </Box>
                    </Box>



                    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ marginTop: 2 }}>
                        <Tab label="Course Details" />
                        <Tab label="Sections and Lessons" />
                        <Tab label="Quizzes" />
                    </Tabs>



                    {tabValue === 0 && (
                        <Box mt={2} p={3} sx={{ backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: 2 }}>
                            <Typography variant="h5" gutterBottom>
                                Update Course
                            </Typography>
                            <Formik
                                initialValues={{
                                    title: course.title,
                                    description: course.description,
                                    duration: course.duration,
                                    category: course.category,
                                    preview_image: course.preview_image || ''
                                }}
                                onSubmit={handleUpdateCourse}
                            >
                                {({ handleChange, handleSubmit, setFieldValue, values }) => (
                                    <Form onSubmit={handleSubmit}>
                                        <Field
                                            as={TextField}
                                            name="title"
                                            label="Course Title"
                                            variant="outlined"
                                            fullWidth
                                            onChange={handleChange}
                                            margin="normal"
                                            sx={{ backgroundColor: '#fff' }}
                                        />
                                        <Field
                                            as={TextField}
                                            name="description"
                                            label="Description"
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            onChange={handleChange}
                                            margin="normal"
                                            sx={{ backgroundColor: '#fff' }}
                                        />
                                        <Field
                                            as={TextField}
                                            name="duration"
                                            label="Duration (hours)"
                                            variant="outlined"
                                            fullWidth
                                            type="number"
                                            onChange={handleChange}
                                            margin="normal"
                                            sx={{ backgroundColor: '#fff' }}
                                        />
                                        <FormControl fullWidth variant="outlined" margin="normal">
                                            <InputLabel>Category</InputLabel>
                                            <Field
                                                as={Select}
                                                name="category"
                                                label="Category"
                                                onChange={(event) => setFieldValue('category', event.target.value)}
                                            >
                                                {categories.map((category) => (
                                                    <MenuItem key={category} value={category}>
                                                        {category}
                                                    </MenuItem>
                                                ))}
                                            </Field>
                                        </FormControl>

                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => { handleImageUpload(event, setFieldValue) }}
                                                style={{ marginTop: '16px' }}
                                            />
                                            {progress > 0 && (
                                                <LinearProgress variant="determinate" value={progress} />
                                            )}
                                        </div>

                                        {values.preview_image && (
                                            <Box mt={2}>
                                                <Typography variant="subtitle1">Current Preview:</Typography>
                                                <img src={values.preview_image} alt="Course Preview" style={{ maxWidth: '100%', height: 'auto', marginTop: '8px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }} />
                                            </Box>
                                        )}

                                        <Field
                                            as={TextField}
                                            name="preview_image"
                                            label="Image URL"
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                            sx={{ backgroundColor: '#fff' }}
                                        />
                                        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '16px' }}>
                                            Update Course
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    )}


                    {tabValue === 1 && (
                        <Box mt={2} p={2} sx={{ backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <Box mb={2}>
                                <Button variant="contained" color="primary" onClick={() => setOpenAddSection(true)} sx={{ marginRight: 1 }}>
                                    Add Section
                                </Button>
                            </Box>

                            <List>
                                {course.sections && course.sections.map(section => (
                                    <div key={section._id}>
                                        <ListItem button onClick={() => setExpandedSection(expandedSection === section._id ? null : section._id)} sx={{ backgroundColor: '#fff', borderRadius: '4px', marginBottom: '8px', boxShadow: 1 }}>
                                            <ListItemText primary={section.title} />
                                            <IconButton>
                                                {expandedSection === section._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                            <IconButton onClick={() => deleteSection(section._id)} color="secondary">
                                                Delete
                                            </IconButton>
                                        </ListItem>
                                        <Collapse in={expandedSection === section._id} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {section.lessons && section.lessons.map((lesson, index) => (
                                                    <ListItem key={index} sx={{ backgroundColor: '#e3f2fd', borderRadius: '4px', marginBottom: '4px' }}>
                                                        <Box mt={1} sx={{ width: '100%' }}>
                                                            {renderLesson(lesson, section)}
                                                        </Box>
                                                    </ListItem>
                                                ))}
                                                <Button variant="outlined" onClick={() => { setSelectedSectionId(section._id); setOpenAddFile(true); }} sx={{ mt: 1 }}>
                                                    Add File
                                                </Button>
                                            </List>
                                        </Collapse>
                                    </div>
                                ))}
                            </List>
                        </Box>
                    )}

                    {tabValue === 2 && (
                        <Box mt={2} p={2} sx={{ backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <Typography variant="h5" gutterBottom>
                                Quizzes
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenAddQuiz(true)}
                                sx={{ marginBottom: 2 }}
                            >
                                Add Quiz
                            </Button>

                            <List>
                                {course.quizzes && course.quizzes.map((quiz) => (
                                    <div key={quiz._id}>
                                        <ListItem
                                            sx={{
                                                backgroundColor: '#fff',
                                                borderRadius: '4px',
                                                marginBottom: '8px',
                                                boxShadow: 1,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleToggle(quiz._id)}
                                        >
                                            <ListItemText primary={quiz.title} />
                                            <IconButton onClick={() => deleteQuiz(quiz._id)} color="secondary">
                                                Delete
                                            </IconButton>
                                            {expandedQuiz === quiz._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </ListItem>
                                        <Collapse in={expandedQuiz === quiz._id} timeout="auto" unmountOnExit>
                                            <Box sx={{ padding: 2 }}>
                                                {quiz.questions.map((question) => (
                                                    <Box key={question._id} sx={{ marginBottom: 2, padding: 1, backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                                                        <Typography variant="body1"><strong>Question:</strong> {question.question}</Typography>
                                                        <Typography variant="body2"><strong>Options:</strong></Typography>
                                                        <List>
                                                            {question.options.map((option, index) => (
                                                                <ListItem key={index}>
                                                                    <ListItemText primary={option} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                        <Typography variant="body2" color="green"><strong>Correct Answer:</strong> {question.correctAnswer}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </div>
                                ))}
                            </List>
                        </Box>
                    )}


                    {/* Dialog for adding a section */}
                    <Dialog open={openAddSection} onClose={() => setOpenAddSection(false)}>
                        <DialogTitle>Add Section</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Section Title"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newSectionTitle}
                                onChange={(e) => setNewSectionTitle(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAddSection(false)} color="primary">Cancel</Button>
                            <Button onClick={handleAddSection} color="primary">Add</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Dialog for adding a file */}
                    <Dialog open={openAddFile} onClose={() => setOpenAddFile(false)}>
                        <DialogTitle>Add File</DialogTitle>
                        <DialogContent>
                            <Input
                                accept="video/*,image/*,application/pdf"
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            {progress > 0 && <LinearProgress variant="determinate" value={progress} />}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAddFile(false)} color="primary">Cancel</Button>
                            <Button onClick={handleUploadFile} color="primary" disabled={!file || progress > 0}>
                                Upload
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Dialog for adding a quiz */}
                    <Dialog open={openAddQuiz} onClose={() => setOpenAddQuiz(false)}>
                        <DialogTitle>Add Quiz</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Quiz Title"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                            />
                            <Box mt={2}>
                                <TextField
                                    fullWidth
                                    label="Question"
                                    variant="outlined"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                            </Box>
                            {options.map((option, index) => (
                                <TextField
                                    key={index}
                                    fullWidth
                                    label={`Option ${index + 1}`}
                                    variant="outlined"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    margin="normal"
                                />
                            ))}
                            <TextField
                                fullWidth
                                label="Correct Answer"
                                variant="outlined"
                                value={correctAnswer}
                                onChange={(e) => setCorrectAnswer(e.target.value)}
                                margin="normal"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAddQuiz(false)} color="primary">Cancel</Button>
                            <Button onClick={handleAddQuiz} color="primary">Add Quiz</Button>
                        </DialogActions>
                    </Dialog>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </Container>
    );
};

export default CourseDetail;
