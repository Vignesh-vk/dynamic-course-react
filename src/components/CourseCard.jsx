import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Card, CardContent, Typography, Button, CardMedia, Box } from '@mui/material';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const StyledCard = styled(Card)`
  margin: 10px 0;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

const CourseCard = ({ course, onDelete, onPreview }) => (
  <TransitionGroup>
    <CSSTransition timeout={500} classNames="fade">
      <StyledCard>
        <Box onClick={() => onPreview(course._id)}>
          <CardMedia
            component="img"
            height="140"
            image={course.preview_image}
            alt={course.title}
            sx={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
          />
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {course.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Duration: {course.duration} hours
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Sections: {course.totalSections}
            </Typography>
          </CardContent>
        </Box>
        {(localStorage.getItem("role") == "instructor") && 
        <CardContent>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" component={Link} to={`/course/${course._id}`} style={{ marginRight: '10px' }}>
              Edit
            </Button>
            <Button variant="contained" color="secondary" onClick={() => onDelete(course._id)}>
              Delete
            </Button>
          </Box>
        </CardContent>}
      </StyledCard>
    </CSSTransition>
  </TransitionGroup>
);

export default CourseCard;
