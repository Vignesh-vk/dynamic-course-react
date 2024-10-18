import React, { useState, useEffect } from 'react';
import CourseForm from './CourseForm';
import { Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Box, Select, MenuItem, FormControl } from '@mui/material';
import { List } from 'antd';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../CourseCard';
import axiosInstance from '../../AxiosInstance';

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(localStorage.getItem("role") === "instructor" ? "all" : "published");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    "Programming",
    "Design",
    "Marketing",
    "Business"
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [courses, filter, selectedCategory]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses/list-courses');
      setCourses(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        console.error('Failed to fetch courses:', error);
      }
    }
  };

  const addCourse = async (course) => {
    try {
      const response = await axiosInstance.post('/courses/courses', course);
      setCourses((prevCourses) => [...prevCourses, response.data]);
      setOpen(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        console.error('Failed to fetch courses:', error);
      }
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onDeleteCourse = async (id) => {
    try {
      await axiosInstance.delete(`/courses/${id}`);
      fetchCourses();
      alert("Course deleted successfully!");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        console.error('Failed to fetch courses:', error);
      }
    }
  };

  const applyFilter = () => {
    let filtered = courses;

    if (filter === 'draft') {
      filtered = filtered.filter(course => course.status === 'draft');
    } else if (filter === 'published') {
      filtered = filtered.filter(course => course.status === 'published');
    }

    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
  };

  const handlePreviewClick = (id) => {
    navigate(`/course/preview/${id}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Course Dashboard
      </Typography>
      
      <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mb: 2 }}>
        Logout
      </Button>

      {(localStorage.getItem("role") === "instructor") &&
        <Button variant="contained" color="primary" onClick={handleClickOpen} sx={{ mb: 2 }}>
          Add Course
        </Button>
      }

{(localStorage.getItem("role") === "instructor") &&
      <Tabs
        value={filter}
        onChange={(event, newValue) => setFilter(newValue)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="All Courses" value="all" />
        <Tab label="Draft Courses" value="draft" />
        <Tab label="Published Courses" value="published" />
      </Tabs>}

      {(localStorage.getItem("role") === "student") &&
      <Tabs
        value={filter}
        onChange={(event, newValue) => setFilter(newValue)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Courses" value="published" />
      </Tabs>}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <Select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>All Categories</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h5" gutterBottom>
        Course List
      </Typography>

      <List
        grid={{
          gutter: 16,
          column: 2,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
        }}
        dataSource={filteredCourses}
        renderItem={(course) => (
          <List.Item>
            <CourseCard course={course} onPreview={handlePreviewClick} onDelete={onDeleteCourse} />
          </List.Item>
        )}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <CourseForm addCourse={addCourse} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
