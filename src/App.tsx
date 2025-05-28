import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Checkbox } from "./components/ui/checkbox"
import { Switch } from "./components/ui/switch"
import { Badge } from "./components/ui/badge"
import { Timer, CheckCircle2, ListTodo, Settings, Bell, BellOff, Play, Pause, RotateCcw } from 'lucide-react'

function App() {
  // Pomodoro states
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Settings
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4
  });

  // Todo list states
  const [todos, setTodos] = useState<Array<{
    id: string;
    text: string;
    completed: boolean;
    pomodoros: number;
    completedPomodoros: number;
  }>>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedSettings = localStorage.getItem('settings');
    const savedCompletedPomodoros = localStorage.getItem('completedPomodoros');
    
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    if (savedCompletedPomodoros) {
      setCompletedPomodoros(parseInt(savedCompletedPomodoros));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('completedPomodoros', completedPomodoros.toString());
  }, [completedPomodoros]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (soundEnabled) {
        playAlarmSound();
      }
      
      if (mode === 'work') {
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);
        
        // Update completed pomodoros for selected todo
        if (selectedTodoId) {
          setTodos(todos.map(todo => 
            todo.id === selectedTodoId 
              ? { ...todo, completedPomodoros: todo.completedPomodoros + 1 } 
              : todo
          ));
        }
        
        // Determine if it's time for a long break
        if (newCompletedPomodoros % settings.longBreakInterval === 0) {
          setMode('longBreak');
          setTimeLeft(settings.longBreakTime * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(settings.shortBreakTime * 60);
        }
      } else {
        // Break is over, back to work
        setMode('work');
        setTimeLeft(settings.workTime * 60);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, completedPomodoros, settings, selectedTodoId, todos, soundEnabled]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play alarm sound
  const playAlarmSound = () => {
    const audio = new Audio('/alarm.mp3');
    audio.play().catch(error => console.error('Error playing sound:', error));
  };

  // Todo list functions
  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        pomodoros: 1,
        completedPomodoros: 0
      };
      setTodos([...todos, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (selectedTodoId === id) {
      setSelectedTodoId(null);
    }
  };

  const updateTodoPomodoros = (id: string, change: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { 
        ...todo, 
        pomodoros: Math.max(1, todo.pomodoros + change) 
      } : todo
    ));
  };

  const selectTodoForPomodoro = (id: string) => {
    setSelectedTodoId(id === selectedTodoId ? null : id);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setTimeLeft(settings.workTime * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreakTime * 60);
    } else {
      setTimeLeft(settings.longBreakTime * 60);
    }
  };

  // Change timer mode
  const changeTimerMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
    
    if (newMode === 'work') {
      setTimeLeft(settings.workTime * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(settings.shortBreakTime * 60);
    } else {
      setTimeLeft(settings.longBreakTime * 60);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center">Pomodoro Timer & Todo List</h1>
        <p className="text-muted-foreground text-center">Stay focused and productive across all your devices</p>
      </header>

      <Tabs defaultValue="timer" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">Timer</span>
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Todo List</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Timer Tab */}
        <TabsContent value="timer" className="space-y-4">
          <Card className="border-t-8" style={{ borderTopColor: mode === 'work' ? 'hsl(var(--primary))' : mode === 'shortBreak' ? 'hsl(var(--success))' : 'hsl(var(--info))' }}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{mode === 'work' ? 'Work Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
                <Badge variant="default">
                  {mode === 'work' ? 'Focus' : 'Rest'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {selectedTodoId ? (
                  <div className="flex items-center gap-2">
                    <span>Working on:</span>
                    <span className="font-medium">
                      {todos.find(todo => todo.id === selectedTodoId)?.text}
                    </span>
                  </div>
                ) : 'No task selected'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-6xl md:text-7xl font-mono font-bold mb-8">
                {formatTime(timeLeft)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-6">
                <Button 
                  variant={mode === 'work' ? 'default' : 'outline'} 
                  onClick={() => changeTimerMode('work')}
                  className="h-10"
                >
                  Work
                </Button>
                <Button 
                  variant={mode === 'shortBreak' ? 'default' : 'outline'} 
                  onClick={() => changeTimerMode('shortBreak')}
                  className="h-10"
                >
                  Short
                </Button>
                <Button 
                  variant={mode === 'longBreak' ? 'default' : 'outline'} 
                  onClick={() => changeTimerMode('longBreak')}
                  className="h-10"
                >
                  Long
                </Button>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setIsActive(!isActive)}
                  className="w-32"
                >
                  {isActive ? (
                    <><Pause className="mr-2 h-4 w-4" /> Pause</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" /> Start</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={resetTimer}
                  className="w-32"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? (
                    <><Bell className="h-4 w-4 mr-1" /> Sound On</>
                  ) : (
                    <><BellOff className="h-4 w-4 mr-1" /> Sound Off</>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedPomodoros} completed</span>
              </div>
            </CardFooter>
          </Card>
          
          {todos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Select Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todos.filter(todo => !todo.completed).slice(0, 3).map(todo => (
                    <div key={todo.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id={`select-${todo.id}`}
                          checked={selectedTodoId === todo.id}
                          onCheckedChange={() => selectTodoForPomodoro(todo.id)}
                        />
                        <Label htmlFor={`select-${todo.id}`} className="cursor-pointer">
                          {todo.text}
                        </Label>
                      </div>
                      <Badge variant="outline">
                        {todo.completedPomodoros}/{todo.pomodoros}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#todos">View all tasks</a>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Todo List Tab */}
        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  addTodo();
                }}
                className="flex gap-2"
              >
                <Input 
                  placeholder="What do you need to do?" 
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Add Task</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                {todos.filter(todo => !todo.completed).length} remaining, {todos.filter(todo => todo.completed).length} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks yet. Add some tasks to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Tasks */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Active Tasks</h3>
                    {todos.filter(todo => !todo.completed).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active tasks</p>
                    ) : (
                      todos
                        .filter(todo => !todo.completed)
                        .map(todo => (
                          <div key={todo.id} className="flex items-center justify-between border rounded-md p-3">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox 
                                id={`todo-${todo.id}`}
                                checked={todo.completed}
                                onCheckedChange={() => toggleTodoCompletion(todo.id)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={`todo-${todo.id}`} className="cursor-pointer">
                                  {todo.text}
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {todo.completedPomodoros}/{todo.pomodoros} pomodoros
                                  </Badge>
                                  {selectedTodoId === todo.id && (
                                    <Badge variant="default" className="text-xs">Selected</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => updateTodoPomodoros(todo.id, -1)}
                                disabled={todo.pomodoros <= 1}
                              >
                                -
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => updateTodoPomodoros(todo.id, 1)}
                              >
                                +
                              </Button>
                              <Button 
                                variant={selectedTodoId === todo.id ? "default" : "outline"} 
                                size="sm"
                                onClick={() => selectTodoForPomodoro(todo.id)}
                              >
                                {selectedTodoId === todo.id ? "Selected" : "Select"}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteTodo(todo.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Completed Tasks */}
                  {todos.filter(todo => todo.completed).length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Completed Tasks</h3>
                      {todos
                        .filter(todo => todo.completed)
                        .map(todo => (
                          <div key={todo.id} className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox 
                                id={`todo-${todo.id}`}
                                checked={todo.completed}
                                onCheckedChange={() => toggleTodoCompletion(todo.id)}
                              />
                              <Label 
                                htmlFor={`todo-${todo.id}`} 
                                className="cursor-pointer line-through text-muted-foreground"
                              >
                                {todo.text}
                              </Label>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
              <CardDescription>Customize your Pomodoro experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workTime">Work Time (minutes)</Label>
                  <Input 
                    id="workTime"
                    type="number" 
                    min="1"
                    max="60"
                    value={settings.workTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      workTime: parseInt(e.target.value) || 25
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreakTime">Short Break (minutes)</Label>
                  <Input 
                    id="shortBreakTime"
                    type="number" 
                    min="1"
                    max="30"
                    value={settings.shortBreakTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      shortBreakTime: parseInt(e.target.value) || 5
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakTime">Long Break (minutes)</Label>
                  <Input 
                    id="longBreakTime"
                    type="number" 
                    min="1"
                    max="60"
                    value={settings.longBreakTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      longBreakTime: parseInt(e.target.value) || 15
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakInterval">Long Break After (pomodoros)</Label>
                  <Input 
                    id="longBreakInterval"
                    type="number" 
                    min="1"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) => setSettings({
                      ...settings,
                      longBreakInterval: parseInt(e.target.value) || 4
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
                <Label htmlFor="sound">Enable Sound Notifications</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={resetTimer}>Apply Settings</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This Pomodoro Timer & Todo List app helps you stay focused and productive using the Pomodoro Technique. 
                Work in focused intervals, take short breaks, and track your tasks all in one place.
              </p>
              <p className="text-muted-foreground mt-2">
                Your data is saved locally on your device and syncs across your iPhone, iPad, and Mac when using the same browser.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
