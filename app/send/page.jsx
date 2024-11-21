"use client"
import { useState } from 'react';
import Select from 'react-select';
import { Picker } from 'emoji-mart';

export default function PostCreation() {
  const [selectedMedia, setSelectedMedia] = useState([2]); // Default selected media
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState([
    { id: 1, name: 'dropbox', type: 'folder', contents: [
      { id: 5, name: 'march.jpg', type: 'file', size: '837.54KB', url: '/march.jpg' },
      { id: 6, name: 'art_space.jpg', type: 'file', size: '1.37MB', url: '/art_space.jpg' },
    ]},
    { id: 2, name: 'unnamed.jpg', type: 'file', size: '837.54KB', url: '/unnamed.jpg' },
    { id: 3, name: 'pink-texture.jpg', type: 'file', size: '97.91KB', url: '/pink-texture.jpg' },
    { id: 4, name: 'misc_bg.jpg', type: 'file', size: '690.32KB', url: '/misc_bg.jpg' },
  ]);

  const profiles = [
    { value: 'profile1', label: 'Profile 1' },
    { value: 'profile2', label: 'Profile 2' },
    { value: 'profile3', label: 'Profile 3' }
  ];

  const handleMediaSelect = (id) => {
    setSelectedMedia((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((mediaId) => mediaId !== id)
        : [...prevSelected, id]
    );
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFile = {
        id: media.length + 1,
        name: file.name,
        type: 'file',
        size: (file.size / 1024).toFixed(2) + 'KB',
        url: URL.createObjectURL(file),
      };
      setMedia([...media, newFile]);
    }
  };

  const handleProfileSelect = (selectedOptions) => {
    setSelectedProfiles(selectedOptions);
  };

  const removeSelectedMedia = (id) => {
    setSelectedMedia((prevSelected) => prevSelected.filter((mediaId) => mediaId !== id));
  };

  const addEmoji = (emoji) => {
    setCaption(caption + emoji.native);
  };

  const displayedMedia = currentFolder ? currentFolder.contents : media;
  const selectedMediaItems = media.filter((item) => selectedMedia.includes(item.id));

  return (
    <div className="flex p-4 gap-4">
      {/* Media Section */}
      <div className="w-1/3 bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Media</h2>

        {/* Upload New Media */}
        <div className="mb-4">
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={handleUpload}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload New
          </label>
        </div>

        {/* Breadcrumb Navigation */}
        {currentFolder && (
          <div className="mb-4">
            <button
              className="text-blue-500 underline"
              onClick={() => setCurrentFolder(null)}
            >
              Back to folders
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {displayedMedia.map((item) => (
            <div
              key={item.id}
              className={`border p-2 rounded-lg flex flex-col justify-center items-center cursor-pointer ${
                selectedMedia.includes(item.id) ? 'border-blue-500' : ''
              }`}
              onClick={() => handleMediaSelect(item.id)} // انتخاب یا لغو انتخاب عکس
            >
              {item.type === 'folder' ? (
                <div
                  className="text-yellow-500 text-3xl"
                  onClick={() => handleFolderClick(item)}
                >
                  📁
                </div>
              ) : (
                <img
                  src={item.url || `/${item.name}`}
                  alt={item.name}
                  className="w-full h-16 object-cover"
                />
              )}
              <p className="text-xs mt-2 text-center">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Post Section */}
      <div className="w-1/3 bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">New Post</h2>

        {/* Profile Selection */}
        <div className="mb-4">
          <label className="block mb-2">Select Profile(s)</label>
          <Select
            isMulti
            options={profiles}
            value={selectedProfiles}
            onChange={handleProfileSelect}
            className="w-full"
          />
        </div>

        {/* Write a caption */}
        <div className="mb-4 relative">
          <label className="block mb-2">Write a caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 border rounded-lg h-24"
            placeholder="Write a caption"
          />
          {/* Emoji Picker Toggle Button */}
          <button
            className="absolute top-2 right-2 bg-gray-200 p-1 rounded-full"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute z-10 top-12 right-0">
              <Picker onSelect={addEmoji} />
            </div>
          )}
        </div>

        {/* Selected Media */}
        <div className="mb-4">
          <label className="block mb-2">Selected Media</label>
          <div className="flex gap-2 flex-wrap">
            {selectedMediaItems.map((item) => (
              <div key={item.id} className="relative w-16 h-16">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover border border-gray-300 rounded-lg"
                />
                {/* Remove Button (X) */}
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center"
                  onClick={() => removeSelectedMedia(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Post Type Selection */}
        <div className="mb-4">
          <label className="block mb-2">Post type</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="postType"
                value="Media/Carousel"
                checked
              />
              Media/Carousel
            </label>
            <label>
              <input type="radio" name="postType" value="Reels" />
              Reels
            </label>
            <label>
              <input type="radio" name="postType" value="Stories" />
              Stories
            </label>
          </div>
        </div>

        <button className="w-full p-2 bg-blue-500 text-white rounded-lg">
          Send now
        </button>
      </div>


      {/* Network Preview Section */}
      <div className="w-1/3 bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Network Preview</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <p className="ml-4">Username</p>
          </div>
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <p>Post preview here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
