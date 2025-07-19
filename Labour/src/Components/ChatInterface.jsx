// src/components/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ToastContext';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { 
  Card, 
  Form, 
  Button, 
  Badge, 
  ListGroup, 
  InputGroup,
  Spinner,
  Alert
} from 'react-bootstrap';

const ChatInterface = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const laborerId = searchParams.get('laborer');

  useEffect(() => {
    loadChatList();
    if (laborerId) {
      loadChat(laborerId);
    }
  }, [laborerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatList = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/chats/list');
      setChatList(response.data.chats || []);
      
      // If laborerId is provided, find and select that chat
      if (laborerId) {
        const chat = response.data.chats?.find(c => c.participant._id === laborerId);
        if (chat) {
          setSelectedChat(chat);
        }
      }
    } catch (error) {
      console.error('Failed to load chat list:', error);
      showToast('Failed to load chats', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (participantId) => {
    try {
      const response = await axiosInstance.get(`/chats/${participantId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      showToast('Failed to load messages', 'danger');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const response = await axiosInstance.post('/chats/send', {
        recipientId: selectedChat.participant._id,
        message: newMessage.trim()
      });
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
    } catch (error) {
      showToast(error.message || 'Failed to send message', 'danger');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.getTime() - 24*60*60*1000).toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getOnlineStatus = (userId) => {
    return onlineUsers.includes(userId) ? 'online' : 'offline';
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Chat List Sidebar */}
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">💬 Chats</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : chatList.length > 0 ? (
                <ListGroup variant="flush">
                  {chatList.map((chat) => (
                    <ListGroup.Item
                      key={chat._id}
                      action
                      active={selectedChat?._id === chat._id}
                      onClick={() => {
                        setSelectedChat(chat);
                        loadChat(chat.participant._id);
                      }}
                      className="d-flex align-items-center"
                    >
                      <div className="position-relative me-3">
                        <img
                          src={chat.participant.profilePhoto || 'https://via.placeholder.com/40?text=U'}
                          alt={chat.participant.name}
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <span
                          className={`position-absolute bottom-0 end-0 p-1 border border-white rounded-circle ${
                            getOnlineStatus(chat.participant._id) === 'online' 
                              ? 'bg-success' 
                              : 'bg-secondary'
                          }`}
                          style={{ width: '12px', height: '12px' }}
                        ></span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{chat.participant.name}</h6>
                            <small className="text-muted">
                              {chat.lastMessage?.content || 'No messages yet'}
                            </small>
                          </div>
                          <div className="text-end">
                            <small className="text-muted">
                              {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
                            </small>
                            {chat.unreadCount > 0 && (
                              <Badge bg="primary" className="ms-1">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No chats yet</p>
                  <Button variant="outline-primary" as="a" href="/browse-laborers">
                    Browse Laborers
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="col-md-8">
          <Card className="h-100">
            {selectedChat ? (
              <>
                <Card.Header>
                  <div className="d-flex align-items-center">
                    <img
                      src={selectedChat.participant.profilePhoto || 'https://via.placeholder.com/40?text=U'}
                      alt={selectedChat.participant.name}
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0">{selectedChat.participant.name}</h6>
                      <small className={`text-${getOnlineStatus(selectedChat.participant._id) === 'online' ? 'success' : 'muted'}`}>
                        {getOnlineStatus(selectedChat.participant._id) === 'online' ? '🟢 Online' : '⚪ Offline'}
                      </small>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body className="p-0" style={{ height: '400px', overflowY: 'auto' }}>
                  {messages.length > 0 ? (
                    <div className="p-3">
                      {messages.map((message, index) => {
                        const isOwnMessage = message.sender._id === user?.id;
                        const showDate = index === 0 || 
                          formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);
                        
                        return (
                          <div key={message._id}>
                            {showDate && (
                              <div className="text-center my-3">
                                <Badge bg="light" text="dark" className="px-3 py-2">
                                  {formatDate(message.createdAt)}
                                </Badge>
                              </div>
                            )}
                            
                            <div className={`d-flex ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
                              <div
                                className={`max-w-75 ${isOwnMessage ? 'order-2' : 'order-1'}`}
                                style={{ maxWidth: '75%' }}
                              >
                                <div
                                  className={`p-3 rounded ${
                                    isOwnMessage 
                                      ? 'bg-primary text-white' 
                                      : 'bg-light'
                                  }`}
                                >
                                  <div className="mb-1">{message.content}</div>
                                  <small className={`${isOwnMessage ? 'text-white-50' : 'text-muted'}`}>
                                    {formatTime(message.createdAt)}
                                  </small>
                                </div>
                              </div>
                              
                              {!isOwnMessage && (
                                <div className="order-2 ms-2">
                                  <img
                                    src={selectedChat.participant.profilePhoto || 'https://via.placeholder.com/30?text=U'}
                                    alt={selectedChat.participant.name}
                                    className="rounded-circle"
                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No messages yet</p>
                      <p className="text-muted small">Start a conversation!</p>
                    </div>
                  )}
                </Card.Body>
                
                <Card.Footer>
                  <Form onSubmit={sendMessage}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                      />
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={!newMessage.trim() || sending}
                      >
                        {sending ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          '📤'
                        )}
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </>
            ) : (
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <h5 className="text-muted">Select a chat to start messaging</h5>
                  <p className="text-muted">Choose from your chat list or start a new conversation</p>
                </div>
              </Card.Body>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
