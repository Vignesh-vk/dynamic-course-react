import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Collapse,
    IconButton,
    Grid,
    Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axiosInstance from '../../AxiosInstance';

const CoursePreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [expandedSectionId, setExpandedSectionId] = useState(null);
    const [expandedQuizId, setExpandedQuizId] = useState(null);

    useEffect(() => {
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

        fetchCourse();
    }, [id]);

    const handleExpandClick = (sectionId) => {
        setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId);
    };

    const handleQuizExpandClick = (quizId) => {
        setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
    };

    const handleBackClick = () => {
        navigate('/dashboard'); 
    };

    if (!course) {
        return <p>Loading...</p>;
    }

    return (
        <Container>
            <Box mt={2} p={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleBackClick}>
                    Back
                </Button>
                <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    {course.title}
                </Typography>
            </Box>

            <Grid container spacing={2} mt={3}>
                <Grid item xs={12} md={6}>
                    <img 
                        src={course.preview_image} 
                        alt="Course Preview" 
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }} 
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: '8px', boxShadow: 2 }}>
                        <Typography variant="h6">Description:</Typography>
                        <Typography paragraph>{course.description}</Typography>
                        <Typography variant="h6">Duration:</Typography>
                        <Typography>{course.duration} hours</Typography>
                        <Typography variant="h6">Category:</Typography>
                        <Typography>{course.category}</Typography>
                        <Typography variant="h6">Total Section:</Typography>
                        <Typography>{course.totalSections}</Typography>
                    </Box>
                </Grid>
            </Grid>

            <Box mt={4} sx={{ backgroundColor: '#e3f2fd', padding: 2, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Sections:
                </Typography>
                <List>
                    {course.sections.map((section) => (
                        <div key={section._id}>
                            <ListItem button onClick={() => handleExpandClick(section._id)} sx={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: 2, marginBottom: 1 }}>
                                <ListItemText primary={section.title} />
                                <IconButton>
                                    {expandedSectionId === section._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </ListItem>

                            <Collapse in={expandedSectionId === section._id} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <Grid container spacing={2} sx={{ pl: 4 }}>
                                        {section.lessons.map((lesson, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
                                                    <Typography variant="body1" gutterBottom>
                                                        Lesson {index + 1}
                                                    </Typography>
                                                    {lesson.fileUrl.endsWith('.pdf') ? (
                                                        <Typography variant="body2">PDF Document</Typography>
                                                    ) : (
                                                        <img src={lesson.fileUrl} alt={`Lesson ${index + 1}`} style={{ width: '100%', height: '200px', borderRadius: 4 }} />
                                                    )}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </List>
                            </Collapse>
                        </div>
                    ))}
                </List>
            </Box>

            {/* Quiz Section */}
            <Box mt={4} sx={{ backgroundColor: '#e3f2fd', padding: 2, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Quizzes:
                </Typography>
                <List>
                    {course.quizzes.map((quiz) => (
                        <div key={quiz._id}>
                            <ListItem button onClick={() => handleQuizExpandClick(quiz._id)} sx={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: 2, marginBottom: 1 }}>
                                <ListItemText primary={quiz.title} />
                                <IconButton>
                                    {expandedQuizId === quiz._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </ListItem>

                            <Collapse in={expandedQuizId === quiz._id} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <Box sx={{ padding: 2 }}>
                                        {quiz.questions.map((question, index) => (
                                            <Box key={question._id} sx={{ marginBottom: 2, padding: 1, backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                                                <Typography variant="body1"><strong>Question {index + 1}:</strong> {question.question}</Typography>
                                                <Typography variant="body2"><strong>Options:</strong></Typography>
                                                <List>
                                                    {question.options.map((option, idx) => (
                                                        <ListItem key={idx}>
                                                            <ListItemText primary={option} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                <Typography variant="body2" color="green"><strong>Correct Answer:</strong> {question.correctAnswer}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </List>
                            </Collapse>
                        </div>
                    ))}
                </List>
            </Box>
        </Container>
    );
};

export default CoursePreview;
