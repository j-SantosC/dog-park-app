import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from '../../../config';
import { Post } from '../models/post';

@Injectable({
	providedIn: 'root',
})
export class PostService {
	constructor(private http: HttpClient) {}

	createPost(post: any): Observable<any> {
		// const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		return this.http.post<any>(`${config.apiUrl}/posts`, post);
	}

	getAllPosts(): Observable<any[]> {
		return this.http.get<any[]>(`${config.apiUrl}/posts`);
	}

	getPostById(postId: string): Observable<Post> {
		return this.http.get<Post>(`${config.apiUrl}/posts/${postId}`);
	}

	editPost(postId: string, formData: FormData): Observable<any> {
		return this.http.put(`${config.apiUrl}/posts/${postId}`, formData);
	}

	deletePost(postId: string, userId: string, fileName: string): Observable<any> {
		return this.http.delete(`${config.apiUrl}/posts/${postId}`, {
			body: { userID: userId, imageUrl: fileName },
		});
	}
}
