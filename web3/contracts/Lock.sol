// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AnonBoard - A decentralized anonymous feedback and discussion board
/// @author Nithin
/// @notice Users can post, comment, like, and unlike anonymously using wallet addresses

contract AnonBoard {
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 likes;
        uint256 timestamp;
        uint256[] commentIds;
    }

    struct Comment {
        uint256 id;
        uint256 postId;
        address author;
        string content;
        uint256 timestamp;
    }

    uint256 public nextPostId;
    uint256 public nextCommentId;

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string content,
        uint256 timestamp
    );
    event CommentAdded(
        uint256 indexed commentId,
        uint256 indexed postId,
        address indexed author,
        string content,
        uint256 timestamp
    );
    event PostLiked(uint256 indexed postId, address indexed user);
    event PostUnliked(uint256 indexed postId, address indexed user);

    /// @notice Create a new post (question / feedback / suggestion)
    function createPost(string memory _content) external {
        require(bytes(_content).length > 0, "Content cannot be empty");

        posts[nextPostId] = Post({
            id: nextPostId,
            author: msg.sender,
            content: _content,
            likes: 0,
            timestamp: block.timestamp,
            commentIds: new uint256[](0)
        });

        emit PostCreated(nextPostId, msg.sender, _content, block.timestamp);
        nextPostId++;
    }

    /// @notice Add a comment or suggestion to an existing post
    function addComment(uint256 _postId, string memory _content) external {
        require(_postId < nextPostId, "Post does not exist");
        require(bytes(_content).length > 0, "Comment cannot be empty");

        comments[nextCommentId] = Comment({
            id: nextCommentId,
            postId: _postId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });

        posts[_postId].commentIds.push(nextCommentId);

        emit CommentAdded(
            nextCommentId,
            _postId,
            msg.sender,
            _content,
            block.timestamp
        );
        nextCommentId++;
    }

    /// @notice Toggle like/unlike for a post
    function toggleLike(uint256 _postId) external {
        require(_postId < nextPostId, "Post does not exist");

        if (hasLiked[_postId][msg.sender]) {
            hasLiked[_postId][msg.sender] = false;
            posts[_postId].likes -= 1;
            emit PostUnliked(_postId, msg.sender);
        }
        else {
            hasLiked[_postId][msg.sender] = true;
            posts[_postId].likes += 1;
            emit PostLiked(_postId, msg.sender);
        }
    }

    /// @notice Get all comments for a post
    function getComments(
        uint256 _postId
    ) external view returns (Comment[] memory) {
        require(_postId < nextPostId, "Post does not exist");

        uint256[] memory ids = posts[_postId].commentIds;
        Comment[] memory result = new Comment[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = comments[ids[i]];
        }

        return result;
    }

    /// @notice Get total number of posts
    function getTotalPosts() external view returns (uint256) {
        return nextPostId;
    }
}
