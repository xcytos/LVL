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

  // Enhanced data loading with automatic conversion for returning users
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Check for existing data in localStorage
        const storedTasks = localStorage.getItem('lvl-tasks');
        const storedLevel = localStorage.getItem('lvl-level');
        const storedXP = localStorage.getItem('lvl-xp');
        const storedStreak = localStorage.getItem('lvl-streak');
        const storedProgress = localStorage.getItem('lvl-progress');
        
        // If user has existing data, load it
        if (storedTasks || storedLevel || storedXP || storedStreak) {
          console.log('Found existing user data, converting settings...');
          
          if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            setTasks(parsedTasks);
          }
          
          if (storedLevel) {
            setCurrentLevel(parseInt(storedLevel));
          }
          
          if (storedXP) {
            setCurrentXP(parseInt(storedXP));
          }
          
          if (storedStreak) {
            setDailyStreak(parseInt(storedStreak));
          }
          
          if (storedProgress) {
            setTodayProgress(parseInt(storedProgress));
          }
          
          // Mark as converted user
          localStorage.setItem('lvl-converted', 'true');
        } else {
          // New user - check if they want to load mock data
          const isNewUser = !localStorage.getItem('lvl-converted');
          if (isNewUser) {
            console.log('New user detected, ready to load mock data if requested');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Enhanced save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('lvl-tasks', JSON.stringify(tasks));
      localStorage.setItem('lvl-level', currentLevel.toString());
      localStorage.setItem('lvl-xp', currentXP.toString());
      localStorage.setItem('lvl-streak', dailyStreak.toString());
      localStorage.setItem('lvl-progress', todayProgress.toString());
      localStorage.setItem('lvl-next-xp', nextLevelXP.toString());
      localStorage.setItem('lvl-last-save', new Date().toISOString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [tasks, currentLevel, currentXP, dailyStreak, todayProgress, nextLevelXP]);

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

  // Handle click outside to minimize - prevent when settings or modals are open
  const handleClickOutside = (e) => {
    // Don't minimize if settings or modals are open
    if (showSettings || showAddTaskModal) {
      return;
    }
    
    // Don't minimize if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }
    
    // Only minimize from home view
    if (currentView === "home") {
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

  // Enhanced backup data to JSON file with efficient format
  const backupData = () => {
    const backupObject = {
      userData: {
        currentLevel,
        currentXP,
        nextLevelXP,
        dailyStreak,
        todayProgress,
        totalTasksCompleted: tasks.filter(t => t.completed).length,
        totalXPEarned: tasks.reduce((total, task) => total + (task.completed ? task.xp : 0), 0),
        achievements: [
          "first_task_completed",
          "streak_week",
          `level_up_${currentLevel}`,
          "task_master"
        ]
      },
      tasks: tasks.map(task => ({
        ...task,
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(task.completed && { completedAt: task.completedAt || new Date().toISOString() })
      })),
      settings: {
        theme: "dark",
        notifications: true,
        soundEnabled: true,
        autoSave: true,
        defaultCategory: "work",
        defaultPriority: "medium"
      },
      statistics: {
        totalTasksCreated: tasks.length,
        totalTasksCompleted: tasks.filter(t => t.completed).length,
        completionRate: tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(1) : 0,
        averageXPPerTask: tasks.length > 0 ? (tasks.reduce((total, task) => total + task.xp, 0) / tasks.length).toFixed(1) : 0,
        mostActiveCategory: "work",
        currentStreak: dailyStreak,
        longestStreak: dailyStreak,
        dailyGoal: 5,
        weeklyGoal: 25,
        monthlyGoal: 100
      },
      exportDate: new Date().toISOString(),
      version: "1.0.0",
      author: "syedmuzamil"
    };
    
    const dataStr = JSON.stringify(backupObject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `lvl-widget-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Backup created successfully!');
  };

  // Enhanced restore data from JSON file with format detection
  const restoreData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // Handle new format (with userData object)
          if (backupData.userData && backupData.tasks) {
            setTasks(backupData.tasks);
            setCurrentLevel(backupData.userData.currentLevel || 1);
            setCurrentXP(backupData.userData.currentXP || 0);
            setNextLevelXP(backupData.userData.nextLevelXP || 100);
            setDailyStreak(backupData.userData.dailyStreak || 0);
            setTodayProgress(backupData.userData.todayProgress || 0);
          }
          // Handle old format (direct properties)
          else if (backupData.tasks) {
            setTasks(backupData.tasks);
            if (backupData.currentLevel) setCurrentLevel(backupData.currentLevel);
            if (backupData.currentXP) setCurrentXP(backupData.currentXP);
            if (backupData.nextLevelXP) setNextLevelXP(backupData.nextLevelXP);
            if (backupData.dailyStreak) setDailyStreak(backupData.dailyStreak);
            if (backupData.todayProgress) setTodayProgress(backupData.todayProgress);
          }
          
          // Reset the file input
          event.target.value = '';
          
          alert('Data restored successfully! The app will reload automatically.');
          
          // Reload the app to ensure all changes take effect
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
        } catch (error) {
          console.error('Restore error:', error);
          alert('Error restoring data: Invalid backup file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Banner view component - compact task display
  const BannerView = () => (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden max-h-[600px] flex flex-col">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-3 relative overflow-hidden flex-shrink-0">
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

      {/* Tasks only - scrollable */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <CategoryIcon className="w-3 h-3 text-gray-300 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm font-medium break-words ${
                            task.completed ? "line-through text-gray-400" : "text-white"
                          }`}
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]} font-medium flex-shrink-0`}>
                            {task.priority}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium">{task.xp}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-6 h-6 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
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
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-gray-700/50 max-h-[400px] flex flex-col">
      {/* Minimal header */}
      <div className="bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-cyan-600/80 p-2 relative flex-shrink-0">
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

      {/* Tasks only - scrollable */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {filteredTasks.slice(0, 5).map((task) => {
          const CategoryIcon = categoryIcons[task.category];
          return (
            <div
              key={task.id}
              className={`p-3 rounded-lg bg-gradient-to-r ${categoryColors[task.category]}/5 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 ${
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
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium break-words ${
                        task.completed ? "line-through text-gray-400" : "text-white"
                      }`}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
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
      <div className="bg-gray-800 rounded-2xl p-6 w-80 max-w-md mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={closeAddTaskModal}
              className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={closeAddTaskModal}
              className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden max-h-[600px] flex flex-col">
      {/* Header with Level Info */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 relative overflow-hidden flex-shrink-0">
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
            
            <div className="absolute top-2 left-2 flex gap-1">
              <button 
                onClick={() => setCurrentView("banner")}
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
                title="Back to Banner"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">

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
        <div className="space-y-3">
          {/* Category Filter Buttons */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Filter by Category</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  filter === "all" 
                    ? "bg-white text-gray-900 shadow-md" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("work")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  filter === "work" 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md" 
                    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 hover:from-blue-500/30 hover:to-cyan-500/30"
                }`}
              >
                <Briefcase className="w-3 h-3" />
                Work
              </button>
              <button
                onClick={() => setFilter("personal")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  filter === "personal" 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" 
                    : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30"
                }`}
              >
                <User className="w-3 h-3" />
                Personal
              </button>
              <button
                onClick={() => setFilter("health")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  filter === "health" 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md" 
                    : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30"
                }`}
              >
                <Heart className="w-3 h-3" />
                Health
              </button>
              <button
                onClick={() => setFilter("learning")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  filter === "learning" 
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md" 
                    : "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-300 hover:from-orange-500/30 hover:to-yellow-500/30"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                Learning
              </button>
            </div>
          </div>
          
          {/* Status Filter Buttons */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Filter by Status</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  filter === "pending" 
                    ? "bg-yellow-500 text-white shadow-md" 
                    : "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                }`}
              >
                <Circle className="w-3 h-3" />
                Pending
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  filter === "completed" 
                    ? "bg-green-500 text-white shadow-md" 
                    : "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-3">
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
                    <div className="flex items-start gap-2 mb-2">
                      <CategoryIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium break-words ${
                            task.completed ? "line-through text-gray-500" : "text-white"
                          }`}
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {task.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]} font-medium flex-shrink-0`}>
                          {task.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-medium">{task.xp} XP</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-7 h-7 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
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
      
      </div>
    </div>
  );

  // Enhanced load mock data function with app reload
  const loadMockData = async () => {
    try {
      const response = await fetch('./mock-tasks-backup.json');
      if (response.ok) {
        const mockData = await response.json();
        if (mockData.tasks) {
          setTasks(mockData.tasks);
          if (mockData.userData) {
            setCurrentLevel(mockData.userData.currentLevel || 1);
            setCurrentXP(mockData.userData.currentXP || 0);
            setNextLevelXP(mockData.userData.nextLevelXP || 100);
            setDailyStreak(mockData.userData.dailyStreak || 0);
            setTodayProgress(mockData.userData.todayProgress || 0);
          }
          
          // Mark as having data loaded
          localStorage.setItem('lvl-converted', 'true');
          
          alert('Mock data loaded successfully! The app will reload to apply all changes.');
          
          // Reload the app to ensure all changes take effect
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        throw new Error('Mock data file not found');
      }
    } catch (error) {
      console.error('Error loading mock data:', error);
      alert('Could not load mock data. Make sure the mock-tasks-backup.json file is available.');
    }
  };

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
      
      {/* Settings Modal - Independent */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-80 max-w-md mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
                    onClick={loadMockData}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Load Mock Data
                  </Button>
                  
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

              {/* App Info */}
              <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-2">LVL Widget</h3>
                <p className="text-xs text-blue-200">
                  Version 1.0.0 by syedmuzamil<br/>
                  Desktop task widget with leveling system
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
