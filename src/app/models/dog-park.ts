export interface Dog {
	name?: string;
	breed?: string;
	birthdate?: string;
	sex?: string;
	isServiceDog?: boolean;
	id: string;
	imageSrc?: string;
	addedAt?: Date;
}

export interface Park {
	id: string;
	latitude?: number;
	longitude?: number;
	name?: string;
	dogs?: Dog[];
}
