import React from 'react'
import { greet } from '../core'

interface GreetComponentProps {
    name: string;
}

export const GreetComponent: React.FC<GreetComponentProps> = ({ name }) => {
    // core 함수의 결과를 React 컴포넌트로 표시
    return <div>{greet(name)}</div>;
}

