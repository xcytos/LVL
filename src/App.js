import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Progress } from './components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import {
  Plus,
  Trophy,
  Flame,
  Target,
  Briefcase,
  User,
  Heart,
  BookOpen,
  Filter,
  SortAsc,
  Star,
  Zap,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Settings,
  Download,
  Upload,
  RotateCcw,
  X,
  Home,
  ArrowLeft,
  Trash2,
} from 'lucide-react';

const categoryIcons = {
  work: Briefcase,
  personal: User,
  health: Heart,
  learning: BookOpen,
};

const categoryColors = {
  work: "from-blue-500 to-cyan-500",
  personal: "from-purple-500 to-pink-500",
  health: "from-green-500 to-emerald-500",
  learning: "from-orange-500 to-yellow-500",
};

const priorityColors = {
  low: "border-green-400 text-green-300 bg-green-500/10",
  medium: "border-yellow-400 text-yellow-300 bg-yellow-500/10",
  high: "border-red-400 text-red-300 bg-red-500/10",
};

// Default tasks are empty for a fresh start
const defaultTasks = [];

export default function LVLWidget() {
  const [tasks, setTasks] = useState(defaultTasks);

  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [currentView, setCurrentView] = useState("banner"); // "banner" or "home"
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initial state for true fresh start
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [todayProgress, setTodayProgress] = useState(0);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('lvl-tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    const storedLevel = localStorage.getItem('lvl-level');
    if (storedLevel) {
      setCurrentLevel(parseInt(storedLevel));
    }

    const storedXP = localStorage.getItem('lvl-xp');
    if (storedXP) {
      setCurrentXP(parseInt(storedXP));
    }

    const storedStreak = localStorage.getItem('lvl-streak');
    if (storedStreak) {
      setDailyStreak(parseInt(storedStreak));
    }
  }, []);

  // Save data to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('lvl-tasks', JSON.stringify(tasks));
    localStorage.setItem('lvl-level', currentLevel.toString());
    localStorage.setItem('lvl-xp', currentXP.toString());
    localStorage.setItem('lvl-streak', dailyStreak.toString());
  }, [tasks, currentLevel, currentXP, dailyStreak]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  // Open add task modal
  const openAddTaskModal = () => {
    setShowAddTaskModal(true);
  };

  // Close modal and reset form
  const closeAddTaskModal = () => {
    setShowAddTaskModal(false);
    setNewTask("");
    setSelectedCategory("");
    setSelectedPriority("");
  };

  // Handle click outside to minimize
  const handleClickOutside = () => {
    if (currentView === "home" && !showSettings && !showAddTaskModal) {
      setIsMinimized(true);
    }
  };

  const addTask = () => {
    if (newTask.trim() && selectedCategory && selectedPriority) {
      const task = {
        id: uuidv4(),
        title: newTask,
        category: selectedCategory,
        priority: selectedPriority,
        completed: false,
        xp: selectedPriority === "high" ? 50 : selectedPriority === "medium" ? 30 : 20,
      };
      setTasks([...tasks, task]);
      closeAddTaskModal();
    }
  };

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // Award XP when completing a task
      setCurrentXP(prev => {
        const newXP = prev + task.xp;
        if (newXP >= nextLevelXP) {
          setCurrentLevel(currentLevel + 1);
          setNextLevelXP(nextLevelXP + 100);
          return newXP - nextLevelXP;
        }
        return newXP;
      });
    }
    
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return task.category === filter;
  });

  // Reset all data to true initial values
  const resetAllData = () => {
    // Clear all localStorage items first
    localStorage.removeItem('lvl-tasks');
    localStorage.removeItem('lvl-level');
    localStorage.removeItem('lvl-xp');
    localStorage.removeItem('lvl-streak');
    
    // Reset all state variables to true initial values (Level 1, 0 XP, etc.)
    setTasks([]);
    setCurrentLevel(1);
    setCurrentXP(0);
    setNextLevelXP(100);
    setDailyStreak(0);
    setTodayProgress(0);
    
    // Reset form fields
    setNewTask("");
    setSelectedCategory("");
    setSelectedPriority("");
    setFilter("all");
    
    // Close settings modal
    setShowSettings(false);
    
    // Force a re-render by clearing and setting localStorage with initial values
    setTimeout(() => {
      localStorage.setItem('lvl-tasks', JSON.stringify([]));
      localStorage.setItem('lvl-level', '1');
      localStorage.setItem('lvl-xp', '0');
      localStorage.setItem('lvl-streak', '0');
    }, 100);
    
    alert('All data has been reset! Starting fresh from Level 1.');
  };

  // Backup data to JSON file
  const backupData = () => {
    const backupObject = {
      tasks,
      currentLevel,
      currentXP,
      nextLevelXP,
      dailyStreak,
      todayProgress,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(backupObject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `lvl-widget-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Restore data from JSON file
  const restoreData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          if (backupData.tasks) setTasks(backupData.tasks);
          if (backupData.currentLevel) setCurrentLevel(backupData.currentLevel);
          if (backupData.currentXP) setCurrentXP(backupData.currentXP);
          if (backupData.nextLevelXP) setNextLevelXP(backupData.nextLevelXP);
          if (backupData.dailyStreak) setDailyStreak(backupData.dailyStreak);
          if (backupData.todayProgress) setTodayProgress(backupData.todayProgress);
          
          alert('Data restored successfully!');
        } catch (error) {
          alert('Error restoring data: Invalid backup file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Banner view component - compact task display
  const BannerView = () => (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Level {currentLevel}</h1>
                <p className="text-white/80 text-xs">{currentXP}/{nextLevelXP} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-orange-300">
                  <Flame className="w-3 h-3" />
                  <span className="text-xs font-semibold">{dailyStreak}</span>
                </div>
                <p className="text-xs text-white/70">streak</p>
              </div>
              <button 
                onClick={() => setCurrentView("home")}
                className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <Home className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks only */}
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {filteredTasks.map((task) => {
          const CategoryIcon = categoryIcons[task.category];
          return (
            <Card
              key={task.id}
              className={`bg-gradient-to-r ${categoryColors[task.category]}/10 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-3 h-3 text-gray-300" />
                      <h3
                        className={`text-sm font-medium truncate ${
                          task.completed ? "line-through text-gray-400" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]} font-medium`}>
                        {task.priority}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-medium">{task.xp}</span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="ml-auto w-6 h-6 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full flex items-center justify-center transition-all duration-200"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks found</p>
            <p className="text-xs">Click home to add tasks!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Minimized view - only tasks
  const MinimizedView = () => (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-gray-700/50">
      {/* Minimal header */}
      <div className="bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-cyan-600/80 p-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-yellow-300" />
            </div>
            <div>
              <span className="text-sm font-bold">Lvl {currentLevel}</span>
              <div className="text-xs text-white/80">{currentXP}/{nextLevelXP} XP</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1 text-orange-300">
                <Flame className="w-3 h-3" />
                <span className="text-xs font-semibold">{dailyStreak}</span>
              </div>
              <p className="text-xs text-white/70">streak</p>
            </div>
            <button 
              onClick={() => setIsMinimized(false)}
              className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Home className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks only */}
      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {filteredTasks.slice(0, 5).map((task) => {
          const CategoryIcon = categoryIcons[task.category];
          return (
            <div
              key={task.id}
              className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[task.category]}/5 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  )}
                </button>
                
                <CategoryIcon className="w-3 h-3 text-gray-300" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${
                      task.completed ? "line-through text-gray-400" : "text-white"
                    }`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs">{task.xp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <Target className="w-full h-full" />
            </div>
            <p className="text-sm">No tasks</p>
          </div>
        )}
        
        {filteredTasks.length > 5 && (
          <div className="text-center py-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              +{filteredTasks.length - 5} more tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Add Task Modal component
  const AddTaskModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-80 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
          </h2>
          <button 
            onClick={closeAddTaskModal}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Task Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
            <input
              type="text"
              placeholder="Enter task title..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              <option value="work">💼 Work</option>
              <option value="personal">👤 Personal</option>
              <option value="health">🏥 Health</option>
              <option value="learning">📚 Learning</option>
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Priority</option>
              <option value="low">🟢 Low (20 XP)</option>
              <option value="medium">🟡 Medium (30 XP)</option>
              <option value="high">🔴 High (50 XP)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={closeAddTaskModal}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={addTask}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              disabled={!newTask.trim() || !selectedCategory || !selectedPriority}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Home view component - full interface
  const HomeView = () => (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setCurrentView("banner")}
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Header with Level Info */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Level {currentLevel}</h1>
                <p className="text-white/80 text-sm">
                  XP: {currentXP}/{nextLevelXP}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-orange-300 mb-1">
                <Flame className="w-4 h-4" />
                <span className="font-semibold">{dailyStreak}</span>
              </div>
              <p className="text-xs text-white/70">day streak</p>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
                title="Minimize"
              >
                <Circle className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
                title="Settings"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {currentLevel + 1}</span>
              <span>{Math.round((currentXP / nextLevelXP) * 100)}%</span>
            </div>
            <Progress value={(currentXP / nextLevelXP) * 100} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-400">{totalTasks}</p>
            <p className="text-xs text-gray-400">Total Tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-400">{todayProgress}%</p>
            <p className="text-xs text-gray-400">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Button */}
      <div className="p-4 bg-gray-800/50">
        <Button
          onClick={openAddTaskModal}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Task
        </Button>
      </div>

      {/* Filter */}
      <div className="p-4 bg-gray-800/30 border-t border-gray-700">
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="health">Health</option>
            <option value="learning">Learning</option>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {filteredTasks.map((task) => {
          const CategoryIcon = categoryIcons[task.category];
          return (
            <Card
              key={task.id}
              className={`bg-gradient-to-r ${categoryColors[task.category]}/10 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200 ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryIcon className="w-4 h-4 text-gray-400" />
                      <h3
                        className={`font-medium truncate ${
                          task.completed ? "line-through text-gray-500" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]} font-medium`}>
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">{task.xp} XP</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-7 h-7 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full flex items-center justify-center transition-all duration-200"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks found</p>
            <p className="text-sm">Add a task to get started!</p>
          </div>
        )}
      </div>

      {/* Achievement Badges */}
      <div className="p-4 bg-gray-800/30 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Recent Achievements
        </h3>
        <div className="flex gap-2 overflow-x-auto">
          <Tooltip content="7-Day Streak Master">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
          </Tooltip>

          <Tooltip content="Task Completionist">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </Tooltip>

          <Tooltip content="Level Up Legend">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-80 max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Data Management */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Data Management</h3>
                
                <div className="space-y-2">
                  <Button 
                    onClick={backupData}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Backup Data
                  </Button>
                  
                  <div className="relative">
                    <input 
                      type="file"
                      accept=".json"
                      onChange={restoreData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Data
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={resetAllData}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All Data
                  </Button>
                </div>
              </div>

              {/* Current Stats */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Current Stats</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{currentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP:</span>
                    <span className="text-white">{currentXP}/{nextLevelXP}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Streak:</span>
                    <span className="text-white">{dailyStreak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Tasks:</span>
                    <span className="text-white">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">{tasks.filter(t => t.completed).length}</span>
                  </div>
                </div>
              </div>

              {/* Fresh Start Info */}
              <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-300 mb-2">Fresh Start</h3>
                <p className="text-xs text-green-200">
                  Start adding tasks to begin your leveling journey! 
                  Complete tasks to earn XP and level up.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      {isMinimized ? (
        <MinimizedView />
      ) : (
        <div onClick={handleClickOutside}>
          {currentView === "banner" ? <BannerView /> : <HomeView />}
        </div>
      )}
      {showAddTaskModal && <AddTaskModal />}
    </TooltipProvider>
  );
}
