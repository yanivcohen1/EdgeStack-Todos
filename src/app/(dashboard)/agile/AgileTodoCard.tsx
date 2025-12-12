import { useState } from "react";
import { Card, CardContent, Typography, IconButton, TextField, Stack, Box, useTheme, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { TodoDTO } from "@/types/todo";
import { UpsertTodoInput } from "@/lib/validation/todo";

interface AgileTodoCardProps {
  todo: TodoDTO;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  updateTodo: (data: UpsertTodoInput) => void;
  deleteTodo: (id: string) => void;
}

export function AgileTodoCard({ todo, provided, snapshot, updateTodo, deleteTodo }: AgileTodoCardProps) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [dueDate, setDueDate] = useState<Date | null>(todo.dueDate ? new Date(todo.dueDate) : null);
  const [duration, setDuration] = useState<number | "">(todo.duration ?? "");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { innerRef, draggableProps, dragHandleProps } = provided;

  const handleSave = () => {
    updateTodo({
      id: todo.id,
      title,
      description: description || undefined,
      status: todo.status,
      dueDate: dueDate || undefined,
      duration: duration === "" ? undefined : Number(duration),
      tags: todo.tags
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    setDuration(todo.duration ?? "");
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteTodo(todo.id);
    setOpenDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  if (isEditing) {
    return (
      <>
        <Card
          ref={innerRef}
          {...draggableProps}
          sx={{
            cursor: "default",
            ...draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Description"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Duration (hours)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <IconButton size="small" onClick={handleDeleteClick} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={handleCancel} color="inherit">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleSave} color="primary">
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <Dialog
          open={openDeleteDialog}
          onClose={handleCancelDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Delete Task?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <Card
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      sx={{
        cursor: "grab",
        "&:hover": { boxShadow: theme.shadows[4] },
        transition: "box-shadow 0.2s",
        position: "relative",
        ...draggableProps.style,
        opacity: snapshot.isDragging ? 0.8 : 1
      }}
    >
      <CardContent sx={{ pr: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {todo.title}
        </Typography>
        {todo.description && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {todo.description}
          </Typography>
        )}
        {todo.dueDate && (
          <Typography variant="caption" display="block" mt={1} color="text.secondary">
            Due: {new Date(todo.dueDate).toLocaleDateString()}
          </Typography>
        )}
        {todo.duration && (
          <Typography variant="caption" display="block" color="text.secondary">
            Duration: {todo.duration}h
          </Typography>
        )}
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
           <IconButton 
             size="small" 
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsEditing(true);
             }}
             onMouseDown={(e) => e.stopPropagation()}
           >
             <EditIcon fontSize="small" />
           </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
